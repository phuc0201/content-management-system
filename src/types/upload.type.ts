export interface UploadedAsset extends Record<string, unknown> {
    id: string;
    url: string;
}

export interface DeleteUploadedAssetResponse extends Record<string, unknown> {
    success: boolean;
    id: string;
}
