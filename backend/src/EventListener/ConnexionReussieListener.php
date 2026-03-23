<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;

final class ConnexionReussieListener
{

    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
    }

    #[AsEventListener]
    public function onLoginSuccessEvent(LoginSuccessEvent $event): void
    {
        $utilisateur = $event->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return;
        }

        $utilisateur->setDateDerniereConnexion(new \DateTime());

        $this->entityManager->flush();
    }
}
