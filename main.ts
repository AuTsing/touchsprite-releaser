import Releaser from './Releaser.ts';
import Storage from './Storage.ts';

const storage = new Storage();
const releaser = new Releaser(storage);

await releaser.doRelease();
