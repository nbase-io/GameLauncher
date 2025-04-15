import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 설정 저장 함수
  saveSettings: (settings: Record<string, unknown>): Promise<any> => {
    return ipcRenderer.invoke('save-settings', settings)
  },

  // 설정 로드 함수
  loadSettings: (): Promise<any> => {
    return ipcRenderer.invoke('load-settings')
  },

  // S3 설정 가져오기
  getS3Config: (): Promise<any> => ipcRenderer.invoke('get-s3-config'),

  // S3 파일 목록 가져오기
  listS3Files: (params: { bucket: string; prefix?: string }): Promise<any> => {
    return ipcRenderer.invoke('list-s3-files', params)
  },

  // S3 파일 업로드
  uploadFileToS3: (params: any): Promise<any> => ipcRenderer.invoke('upload-file-to-s3', params),

  // S3 파일 삭제
  deleteFileFromS3: (params: any): Promise<any> => ipcRenderer.invoke('delete-file-from-s3', params),

  // S3 파일 이름 변경
  renameFileInS3: (params: { bucket: string; oldKey: string; newKey: string }): Promise<any> => {
    return ipcRenderer.invoke('rename-file-in-s3', params)
  },

  // 파일 저장 위치 선택 대화상자 열기
  selectSaveLocation: (params: { defaultPath?: string }): Promise<string | null> => {
    return ipcRenderer.invoke('select-save-location', params)
  },

  // S3 파일 다운로드
  downloadFileFromS3: (params: { bucket: string; key: string; destination: string }): Promise<any> => {
    return ipcRenderer.invoke('download-file-from-s3', params)
  },

  // 임시 파일 생성 (파일 업로드용)
  saveTempFile: (params: { buffer: ArrayBuffer; fileName: string }): Promise<any> => {
    return ipcRenderer.invoke('save-temp-file', params)
  },

  // 임시 파일 삭제
  deleteTempFile: (params: { filePath: string }): Promise<any> => {
    return ipcRenderer.invoke('delete-temp-file', params)
  },

  // 파일 선택 대화상자 열기
  selectFile: (options?: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    properties?: Array<
      | 'openFile'
      | 'openDirectory'
      | 'multiSelections'
      | 'showHiddenFiles'
      | 'createDirectory'
      | 'promptToCreate'
      | 'noResolveAliases'
      | 'treatPackageAsDirectory'
      | 'dontAddToRecent'
    >;
    message?: string;
  }): Promise<string[]> => {
    return ipcRenderer.invoke('select-file', options)
  },

  // 개발자 도구 열기
  openDevTools: (): void => {
    ipcRenderer.send('open-dev-tools')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
