declare module "jsonwebtoken" {
  const jwt: {
    sign(payload: any, secretOrPrivateKey: any, options?: any): string
    verify(token: string, secretOrPublicKey: any, options?: any): any
    decode(token: string, options?: any): any
    [key: string]: any
  }
  export default jwt
}
