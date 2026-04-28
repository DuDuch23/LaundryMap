import type Uppy from '@uppy/core'
import Dashboard from '@uppy/react/dashboard'
import '@uppy/core/css/style.min.css'
import '@uppy/dashboard/css/style.min.css'

export function PhotosUpload({ uppy }: { uppy: Uppy }) {
    return (
        <Dashboard
            uppy={uppy}
            width={"100%"}
            height={500}
            proudlyDisplayPoweredByUppy={false}
        />
    );
}
