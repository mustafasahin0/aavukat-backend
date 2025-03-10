export default interface IStorageService {
   createPreSignedUrl(key: string): Promise<string>;
   deleteObject(key: string): Promise<void>;
}
