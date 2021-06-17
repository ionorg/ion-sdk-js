export function Uint8ArrayToJSONString(dataArray: Uint8Array): string {
  let dataString = '';
  if (dataArray.length >= 2) {
    for (const element of dataArray) {
      dataString += String.fromCharCode(element);
    }
  } else {
    dataString = '{}';
  }
  return dataString;
}
