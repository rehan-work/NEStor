      var ops = require('./opcodes.js');
      var utility = require('./utility.js');

      var operations = {
       234: function() {
        this.log('NOOP', this.registers.PC);
        this.flags.break_command = true;
        this.flags.interrupt_disable = true;
        this.registers.PC += 1;
        },
        NOP: function() {
          this.registers.PC++;
        },
        JSR_ABS: function() {
        // push address of next operation onto the stack
        // then jump to subroutine location
        let nb1 = this.fetch(this.registers.PC+1);
        let nb2 = this.fetch(this.registers.PC+2);
        let j = utility.merge_bytes(nb1, nb2);
        this.log("JSR " + j, this.registers.PC);
        let bytes = utility.split_byte(this.registers.PC+3);
        this.stack.push(bytes[0]);
        this.stack.push(bytes[1]);
        this.cycles -= 6;
        this.registers.SP -= 2;
        this.registers.PC = j;
        },
        TSX: function() {
          this.log("TSX", this.registers.PC)
          this.registers.X = this.registers.SP;
          this.cycles -= 2;

          if (this.registers.X == 0) {
            this.flags.zero = true;
          }

          if (utility.bit(this.registers.X, 7) == 1) {
            this.flags.negative = true;
          }

          this.registers.PC++;
      }, 
      TXS: function() {
          this.log("TXS", this.registers.PC)
          this.registers.SP = this.registers.X;
          this.cycles -= 2;
          this.registers.PC++;
      },
      TYA: function() {
          this.log("TYA", this.registers.PC)
          this.registers.A = this.registers.Y;
          this.cycles -= 2;
          if (this.registers.A == 0) {
            this.flags.zero = true;
          }

          if (utility.bit(this.registers.negative, 7) == 1) {
            this.flags.negative = true;
          }

          this.registers.PC++;
      },
      TAY: function() {
          this.log("TAY", this.registers.PC)
          this.registers.Y = this.registers.A;
          this.cycles -= 2;
          this.registers.PC++;
      },
      TAX: function() {
          this.log("TAX", this.registers.PC)
          this.registers.X = this.registers.A;
          this.cycles -= 2;
          this.registers.PC++;
      },
      TXA: function() {
          this.log("TXA", this.registers.PC)
          this.registers.A = this.registers.X;
          this.cycles -= 2;
          this.registers.PC++;
      },
      INY: function() {
          this.log("INY", this.registers.PC)
          this.registers.Y++;
          this.cycles -= 2;
          this.registers.PC++;
      },
      DEY: function() {
          this.log("DEY", this.registers.PC)
          this.registers.Y--;
          this.cycles -= 2;
          this.registers.PC++;
      },
      DEX: function() {
          this.log("DEY", this.registers.PC)
          this.registers.Y--;
          this.cycles -= 2;
          this.registers.PC++;
      },
      INX: function() {
          this.log("INX", this.registers.PC)
          this.registers.Y++;
          this.cycles -= 2;
          this.registers.PC++;

      },
      ROL_A: function() {
        /* partial */
        this.log("ROL A", this.registers.PC);
        this.registers.A << 1;
        this.cycles -= 2;
        this.registers.PC++;
      },
      LDX_IMM: function() {
          // LDX IMM
          this.log("LDX #$" + this.next_byte(), this.registers.PC)
          this.cycles -= 3;
          this.registers.X = this.next_byte();
          this.registers.PC = this.registers.PC+2;
          if (this.registers.X == 0) {
            this.flags.zero = true;
          }
          if (this.registers.X.toString(2)[7] == 1) {
            this.flags.negative = true;
          }
        },
      LDX_ABS: function() {
          // LDX
          this.log("LDX " + this.next_bytes(), this.registers.PC)
          this.cycles -= 4;
 //         console.log(this.fetch(this.next_bytes()));
          this.registers.X = this.fetch(this.next_bytes());
          this.registers.PC += 3;
        },
      LDA_ABS: function() {
          // LDX
          this.log("LDA $" + this.next_bytes(), this.registers.PC)
          this.cycles -= 4;
          this.registers.A = this.fetch(this.next_bytes());
          this.registers.PC += 3;
        },
      JMP: function() {
          let jmp_addr = this.next_bytes()
          this.log("JMP $" + jmp_addr.toString(16), this.registers.PC);
          this.cycles -= 3;
          this.registers.PC = jmp_addr;
        },
      STX: function() {
          let addr = this.fetch(this.next_byte());
          this.set(addr, this.registers.X)
          this.log("STX $" + addr, this.registers.PC);
          this.cycles -= 3;
          this.registers.PC += 2;
        },
      STX_ZP: function() {
          let addr = this.fetch(this.next_byte());
          this.set(addr, this.registers.X)
          this.log("STX $" + addr, this.registers.PC);
          this.cycles -= 3;
          this.registers.PC += 2;
        },
      STX_ABS: function() {
          let addr3 = this.next_bytes();
          this.set(addr3, this.registers.X)
          this.log("STX $" + addr3, this.registers.PC);
          this.cycles -= 4;
          this.registers.PC += 3;
        },
      STY_ZP: function() {
          let addr1 = this.fetch(this.registers.PC+1);
          this.set(addr1, this.registers.X)
          this.log("STY #" + addr1, this.registers.PC);
          this.cycles -= 2;
          this.registers.PC += 2;
        },
      STA_ABS: function() {
          let sta_address = this.next_bytes();
          this.set(sta_address, this.registers.A);
          this.log("STA $" + sta_address, this.registers.PC);
          this.cycles -= 4;
          this.registers.PC += 3;
        },
      SEC: function() {
          this.log("SEC", this.registers.PC);
          this.flags.carry = true;
          this.cycles -= 2;
          this.registers.PC++;
        },
      BCS: function() {
          let bcs_addr = this.registers.PC+2 + this.next_byte();
          this.log("BCS " + (this.next_byte()+this.registers.PC+2).toString(16), this.registers.PC);
          this.registers.PC += 2;
          if (this.flags.carry == true) {
            this.log("- Branch taken", bcs_addr);
            this.registers.PC = bcs_addr;
          }
        },
      CLC: function() {
          this.log("CLC", this.registers.PC);
          this.flags.carry = false;
          this.cycles -= 2;
          this.registers.PC++;
      },
      CLD: function() {
          this.log("CLD", this.registers.PC);
          this.flags.decimal_mode = false;
          this.cycles -= 2;
          this.registers.PC++;
      },
      CLV: function() {
          this.log("CLD", this.registers.PC);
          this.flags.overflow = false;
          this.cycles -= 2;
          this.registers.PC++;
      },
      PHA: function() {
        this.log("PHA", this.registers.PC);
        this.stack.push(this.registers.A);
        this.cycles -= 3;
        this.registers.SP--;
        this.registers.PC++;
      },
      PLP: function() {
        this.log("PLP", this.registers.PC);
        let pflags = this.stack.pop();
        this.cycles -= 4;
        this.registers.SP++;
        let t = ("00000000" + pflags.toString(2)).substr(-8)
        this.flags.carry = ! t[0];
        this.flags.zero = ! t[1];
        this.flags.interrupt_disable = ! t[2];
        this.flags.decimal_mode = ! t[3];
        this.flags.break_command = ! t[4];
        this.flags.overflow = ! t[6];
        this.flags.negative = ! t[7];
        this.registers.PC++;
      },
      BCC: function() {
          let bcc_addr = this.registers.PC+2 + this.next_byte();
          this.log("BCC " + (this.next_byte()+this.registers.PC+2).toString(16), this.registers.PC);
          this.registers.PC += 2;
          if (this.flags.carry == false) {
            this.log("- Branch taken", bcc_addr);
            this.registers.PC = bcc_addr;
          }
      },
      LDA_IMM: function() {
        this.log("LDA #$" + this.next_byte(), this.registers.PC)
        this.registers.A = this.next_byte();
        this.registers.PC += 2;
        if (this.registers.A == 0) {
          this.flags.zero = true;
        }
      },
      LDA_ZP: function() {
          this.log("LDA $" + this.next_byte(), this.registers.PC)
          this.cycles += 3;
          this.registers.A = this.fetch(this.registers.PC+1);
          this.registers.PC += 2;
          if (this.registers.A == 0) {
            this.flags.zero = true;
          }
      },
      BEQ: function() {
          this.log("BEQ " + (this.next_byte() + this.registers.PC + 2).toString(16), this.registers.PC);
          if (this.flags.zero == true) {
//            this.log("Branch taken", bvs_addr);
            this.registers.PC += 2 + this.next_byte();
          } else {
            this.registers.PC += 2;
          }
      },
      BNE: function() {
          this.log("BNE " + (this.next_byte() + this.registers.PC + 2).toString(16), this.registers.PC);
          if (this.flags.zero == false) {
//            this.log("Branch taken", bvs_addr);
            this.registers.PC += 2 + this.next_byte();
          } else {
            this.registers.PC += 2;
          }
      },
      STA_ZP: function() {
          this.log("STA #" + this.next_byte(), this.registers.PC)
          this.cycles += 3;
          this.set(this.next_byte(), this.registers.A);
          this.registers.PC = this.registers.PC+2;
      },
      BIT: function() {
          this.log("BIT #" + this.next_byte(), this.registers.PC)
          let mem = this.next_byte();
          let r = (this.registers.A & mem).toString(2);
          let s = ("00000000" + r).substr(-8)
          this.flags.negative = !!s[7];
          this.flags.overflow = !!s[6];
          this.registers.PC += 2;
      },
      BVS: function() {
          let bvs_addr = this.registers.PC+2 + this.next_byte();
          this.log("BVS " + (this.next_byte()+this.registers.PC+2).toString(16), this.registers.PC);
          this.registers.PC += 2;
          if (this.flags.overflow == true) {
            this.log("- Branch taken", bvs_addr);
            this.registers.PC = bvs_addr;
          }
      },
      BVC: function() {
          let bvc_addr = this.registers.PC+2 + this.next_byte();
          this.log("BVC " + (this.next_byte()+this.registers.PC+2).toString(16), this.registers.PC);
          this.registers.PC += 2;
          if (this.flags.overflow == false) {
            this.log("- Branch taken", bvc_addr);
            this.registers.PC = bvc_addr;
          }
      },
      BPL: function() {
          let bpl_addr = this.registers.PC+2 + this.next_byte();
          this.log("BPL " + (this.next_byte()+this.registers.PC+2).toString(16), this.registers.PC);
          this.registers.PC += 2;
          if (this.flags.negative == false) {
            this.log("- Branch taken", bpl_addr);
            this.registers.PC = bpl_addr;
          }
      },
      RTS: function() {
         let ret_addr = utility.merge_bytes(this.stack.pop(), this.stack.pop())
         this.registers.SP++;
         this.log("RTS " + ret_addr.toString(16), this.registers.PC)
         this.registers.PC = ret_addr;
      },
      SEI: function() {
        this.flags.interrupt_disable = true;
        this.log("SEI", this.registers.PC);
        this.registers.PC++;
      },
      SED: function() {
        this.flags.decimal_mode = true;
        this.log("SED", this.registers.PC);
        this.cycles -= 2;
        this.registers.PC++;
      },
      PHP: function() {
        this.log("PHP", this.registers.PC);
        this.registers.PC++;
        this.stack.push(this.status_byte());
        this.registers.SP--;
      },
      PLA: function() {
        let byte = this.stack.pop();
        this.registers.SP++;
        this.log("PLA", this.registers.PC);
        this.registers.A = byte;
        if (this.registers.A == 0) {
          this.flags.zero = true;
        }
        if (utility.bit(byte, 7) == 1) {
          this.flags.negative = true;
        }
        this.cycles -= 4;
        this.registers.PC++;
      },
      AND_IMM: function() {
        this.registers.A = this.registers.A & this.next_byte();
        this.log("AND #" + this.next_byte(), this.registers.PC);
        this.cycles -= 2;
        if (this.registers.A == 0) {
          this.flags.zero = true;
        }
        if (this.registers.A.toString(2)[7] == 1) {
          this.flags.negative = true;
        }
        this.registers.PC += 2;
      },
      ADC_IMM: function() {
        this.registers.A = this.registers.A + this.next_byte();
        this.log("BAD ADC #" + this.next_byte(), this.registers.PC);
        this.cycles -= 2;
        this.registers.PC += 2;
      },
      SBC_IMM: function() {
        this.registers.A = this.registers.A - this.next_byte();
        this.log("BAD SBC #" + this.next_byte(), this.registers.PC);
        this.cycles -= 2;
        this.registers.PC += 2;
      },
      CMP_IMM: function() {
        this.log("CMP #" + this.next_byte(), this.registers.PC);
        this.cycles -= 2;
        if (this.registers.A >= this.next_byte()) {
          this.flags.carry = true;
        } else if (this.registers.A == this.flags.zero) {
          this.flags.zero = true;
        } else if ((this.registers.A).toString(2)[7] == 1) {
          this.flags.negative = true;
        }
        this.registers.PC += 2;
      },
      CPY_IMM: function() {
        this.log("CPY #" + this.next_byte(), this.registers.PC);
        let val2 = this.next_byte();
        this.cycles -= 2;
        if (this.registers.Y >= val2) {
          this.registers.carry = true;
        }
        if (this.registers.Y == val2) {
          this.registers.zero = true;
        }
        if (this.registers.Y < val2) {
          this.registers.negative = true;
        }
        this.registers.PC += 2;
      },
      CPX_IMM: function() {
        this.log("CPX #" + this.next_byte(), this.registers.PC);
        let val = this.next_byte();
        this.cycles -= 2;
        if (this.registers.X >= val) {
          this.registers.carry = true;
        }
        if (this.registers.X == val) {
          this.registers.zero = true;
        }
        if (this.registers.X < val) {
          this.registers.negative = true;
        }
        this.registers.PC += 2;
      },
      LDY_IMM: function() {
          this.log("LDY #" + this.next_byte(), this.registers.PC)
          this.registers.Y = this.next_byte();
          this.cycles -= 2;
          this.registers.PC += 2;
      },
      BMI: function() {
        this.log("BMI " + this.next_byte(), this.registers.PC);
        if (this.flags.negative == true) {
          this.registers.PC += this.next_byte() + 2;
        } else {
          this.registers.PC += 2;
        }
      },
      ORA_IMM: function() {
        this.registers.A = this.registers.A | this.next_byte();
        this.cycles -= 2;
        if (this.registers.A == 0) {
          this.flags.zero = true;
        }
        if (this.registers.A.toString(2)[7] == 1) {
          this.flags.negative = true;
        }
        this.registers.PC += 2;
      },
      EOR_IMM: function() {
        this.registers.A = this.registers.A ^ this.next_byte();
        this.cycles -= 2;
        if (this.registers.A == 0) {
          this.flags.zero = true;
        }
        if (this.registers.A.toString(2)[7] == 1) {
          this.flags.negative = true;
        }
        this.registers.PC += 2;
      },
      LSR_A: function() {
        /* partial */
        this.log("LSR A", this.registers.PC);
        this.cycles -= 2;
        this.registers.A >>> 1;
        this.registers.PC++;
      },
      ASL_A: function() {
        /* partial */
        this.log("LSR A", this.registers.PC);
        this.cycles -= 2;
        this.registers.A *= 2;
        this.registers.PC++;
      },
      ROR_A: function() {
        /* partial */
        this.log("ROR A", this.registers.PC);
        this.cycles -= 2;
        this.registers.A >> 1;
        this.registers.PC++;
      }
};

module.exports = operations;