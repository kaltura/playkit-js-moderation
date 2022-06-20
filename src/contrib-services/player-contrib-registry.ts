export class PlayerContribRegistry {
  private _cache: Record<string, {instance: any}> = {};

  static get(player: any): PlayerContribRegistry {
    player.__contrib__ = player.__contrib__ || {};
    player.__contrib__.services =
      player.__contrib__.services || new PlayerContribRegistry();
    return player.__contrib__.services;
  }

  private constructor() {}

  public get(token: string): any {
    const result = this._cache[token];

    if (!result) {
      throw new Error(`cannot find resource with token ${token}`);
    }

    return result;
  }

  public register<T>(token: string, creator: () => T): T {
    let requestedResource = this._cache[token];

    if (!requestedResource) {
      requestedResource = this._cache[token] = {
        instance: creator(),
      };
    }

    return requestedResource.instance;
  }
}
