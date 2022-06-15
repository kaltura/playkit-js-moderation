export class UUID {
  //timestamp
  public static uuidV1() {
    return `${Date.now()}-${Math.random()}`;
  }
}
