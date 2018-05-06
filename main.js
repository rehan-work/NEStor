var fs = require('fs');
var rom = require('./iNES.js');
var cpu = require('./CPU.js');

class Emulator {
    constructor() {
        this.cpu = new cpu;
    }
    insert(filename) {
        this.rom = new rom;
        this.rom.load(filename);
        this.cpu.load_rom(this.rom.prg_rom);
    }
    boot() {
    // initialize states
        this.cpu.registers.P = 0x34;
        this.cpu.registers.A = 0;
        this.cpu.registers.X = 0;
        this.cpu.registers.Y = 0;
        this.cpu.registers.S = 0xFD;
        this.cpu.execute();
    }
    execute() {
        let opcode = this.cpu.memory.fetch(this.cpu.registers.PC);
    }
}

let emu = new Emulator;
emu.insert('smb.nes');
emu.boot();
