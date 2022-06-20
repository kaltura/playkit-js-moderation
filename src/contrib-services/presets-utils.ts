export interface GroupPresetAreasOptions {
  presetAreasMapping: any;
  acceptableTypes: string[];
}

export class PresetsUtils {
  public static groupPresetAreasByType(
    options: GroupPresetAreasOptions
  ): any {
    const {presetAreasMapping, acceptableTypes} = options;

    const result = {};
    // @ts-ignore
    acceptableTypes.forEach(presetType => (result[presetType] = {}));
    Object.keys(presetAreasMapping).forEach(presetName => {
      Object.keys(presetAreasMapping[presetName]).forEach(presetType => {
        if (acceptableTypes.indexOf(presetType) === -1) {
        } else {
          // @ts-ignore
          result[presetType][presetName] =
            presetAreasMapping[presetName][presetType];
        }
      });
    });
    return result;
  }
}
