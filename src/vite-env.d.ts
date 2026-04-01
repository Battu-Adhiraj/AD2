/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_DESKTOP: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
