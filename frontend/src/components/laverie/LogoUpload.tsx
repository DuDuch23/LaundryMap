import type Uppy from '@uppy/core'
import Dashboard from '@uppy/react/dashboard'
import '@uppy/core/css/style.min.css'
import '@uppy/dashboard/css/style.min.css'

export function LogoUpload({ uppy }: { uppy: Uppy }) {
    return (
        <Dashboard
            uppy={uppy}
            width={"100%"}
            height={220}
            proudlyDisplayPoweredByUppy={false}
        />
    );
}
