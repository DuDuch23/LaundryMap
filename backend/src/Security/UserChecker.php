<?php

namespace App\Security;

use App\Entity\Utilisateur;
use App\Enum\StatutUtilisateurEnum;
use App\Enum\StatutProfessionnelEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class UserChecker implements UserCheckerInterface
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof Utilisateur) {
            return;
        }

        if ($user->getStatut() === StatutUtilisateurEnum::STATUT_REFUSE) {
            throw new CustomUserMessageAccountStatusException('ACCOUNT_REFUSED');
        }

        if ($user->getStatut() === StatutUtilisateurEnum::STATUT_BANNI) {
            // Auto-déblocage si blocage temporaire arrivé à terme
            $banniJusquA = $user->getBanniJusquA();
            if ($banniJusquA !== null && $banniJusquA < new \DateTime()) {
                $user->setStatut(StatutUtilisateurEnum::STATUT_VALIDE);
                $user->setBanniJusquA(null);
                $user->setBanniMotif(null);
                try {
                    $this->em->flush();
                } catch (\Throwable) {
                    // flush failed — user stays banned for this request
                }
            } else {
                throw new CustomUserMessageAccountStatusException('ACCOUNT_BANNED');
            }
        }

        if ($user->getStatut() === StatutUtilisateurEnum::STATUT_EN_ATTENTE) {
            throw new CustomUserMessageAccountStatusException('ACCOUNT_PENDING');
        }

        $professionnel = $user->getProfessionnel();

        if ($professionnel) {
            if ($professionnel->getStatut() === StatutProfessionnelEnum::STATUT_REFUSE) {
                throw new CustomUserMessageAccountStatusException('ACCOUNT_REFUSED');
            }

            if ($professionnel->getStatut() === StatutProfessionnelEnum::STATUT_BANNI) {
                throw new CustomUserMessageAccountStatusException('ACCOUNT_BANNED');
            }

            if ($professionnel->getStatut() === StatutProfessionnelEnum::STATUT_EN_ATTENTE) {
                throw new CustomUserMessageAccountStatusException('ACCOUNT_PENDING');
            }
        }
    }

    public function checkPostAuth(UserInterface $user, ?TokenInterface $token = null): void
    {

    }
}
