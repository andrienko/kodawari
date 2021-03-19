import { fileExtension, fileNameWithoutExtension, fileStats, glob, loadFileContents, merge } from '../common/helpers';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import { Data } from '../common/types';

// --

const stringify = (item: any) => {
  try {
    return JSON.stringify(item, null, 2);
  } catch (e) {
    return '[' + e.message + ']';
  }
};

const turnItemToWhatever = (item: any) => {
  if (Array.isArray(item)) {
    return DataArray.fromArray(item);
  } else if (typeof item === 'object' && item !== null) {
    return DataObject.fromObject(item);
  }
  return item;
};

class DataArray extends Array<any> {
  toString(): string {
    return stringify(this);
  }
  static fromArray(array: Array<any>): DataArray {
    const dataArray = new DataArray();
    array.forEach((item) => dataArray.push(turnItemToWhatever(item)));
    return dataArray;
  }
}

class DataObject implements Record<any, any> {
  [key: string]: string | DataObject | DataArray;
  //@ts-ignore
  toString(): string {
    return stringify(this);
  }
  static fromObject(object: Record<any, any>): DataObject {
    const dataObject = new DataObject();
    for (const [key, item] of Object.entries(object)) {
      dataObject[key] = turnItemToWhatever(item);
    }
    return dataObject;
  }
}

const renderYamlFile = (fileContent: string): any => {
  return parseYaml(fileContent);
};

const renderJsonFile = (fileContent: string): any => {
  return JSON.parse(fileContent);
};

const parsers: Record<string, (fileContent: string) => any> = {
  yml: renderYamlFile,
  yaml: renderYamlFile,
  json: renderJsonFile,
};

const renderDataFile = async (filePath: string): Promise<any> => {
  const fileType = fileExtension(filePath);
  const supportedTypes = Object.keys(parsers);
  if (supportedTypes.includes(fileType)) {
    try {
      const contents = await loadFileContents(filePath);
      return parsers[fileType](contents);
    } catch (e) {}
  }
  return null;
};

const getFolderData = async (folder: string): Promise<Data> => {
  const keys: Record<string, any> = {};
  const files = await glob(path.resolve(folder, '*'));
  for (const fileName of files) {
    const key = fileNameWithoutExtension(fileName);
    let value = null;
    const stats = await fileStats(fileName);
    if (stats.isDirectory()) {
      value = await getFolderData(fileName);
    } else {
      value = await renderDataFile(fileName);
    }
    if (value) {
      if (keys[key]) {
        keys[key] = merge(keys[key], value);
      } else {
        keys[key] = value;
      }
    }
  }
  keys.toString = function () {
    return JSON.stringify(this, null, 2);
  };
  return keys;
};

export const getFolderDataObject = async (folder: string): Promise<DataObject> => {
  return DataObject.fromObject(await getFolderData(folder));
}
