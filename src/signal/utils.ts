export function Uint8ArrayToString(dataArray: Uint8Array): string {
    let dataString = '';
    for (const element of dataArray) {
      dataString += String.fromCharCode(element);
    }
    return dataString;
}