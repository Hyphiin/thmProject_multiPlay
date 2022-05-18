export class KeyPressListener {
  keydownFunction: (event: KeyboardEvent) => void;
  keyupFunction: (event: KeyboardEvent) => void;
  constructor(keyCode: string, callback: any) {
    let keySafe = true;
    this.keydownFunction = function (event: KeyboardEvent) {
      if (event.code === keyCode) {
        if (keySafe) {
          keySafe = false;
          callback();
        }
      }
    };
    this.keyupFunction = function (event: KeyboardEvent) {
      if (event.code === keyCode) {
        keySafe = true;
      }
    };
    document.addEventListener('keydown', this.keydownFunction);
    document.addEventListener('keyup', this.keyupFunction);
  }

  unbind() {
    document.removeEventListener('keydown', this.keydownFunction);
    document.removeEventListener('keyup', this.keyupFunction);
  }
}
