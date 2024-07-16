/**
 * make number into string with and show exponent divisible by 3
 * e.g.
 *      0.000012345 -> 1234.5e-6
 *      0.00012345  -> 123.45e-6
 *      0.0012345   -> 1.2345e-3
 *      0.012345789 -> 0.012345789
 *      123.456789  -> 123.456789
 *      1234.56789  -> 1.23456789e+3
 *      123456.789  -> 123.456789e+3
 *      1234567.89  -> 1.23456789e+6
 *      12345678.9  -> 12.3456789e+6
 *      123456789   -> 123.456789e+6
 *      1234567890  -> 1.23456789e+9
 *      12345678900 -> 12.3456789e+9
 */

function roundExponent(exponent: number) {
  return Math.floor(exponent/3)*3;
}

type Digits = { 
    topPos: number 
    bottomPos: number
    get: (pos: number) => number
    set: (pos: number, newDigit: number) => void
    increment: (pos: number) => Digits
    iterate: (from: number, to: number, func: (pos: number) => void) => void
    round: (desiredRoundingPos: number) => Digits
    toAboveBelowFormat: () => {
        digits_above: string
        digits_below: string
    }
} & Record<`${number}`, any>
function digitsObject(digitsAbove: string, digitsBelow: string) {
  let digits: Digits = {} as Digits;
  for (let i = digitsAbove.length-1; i >= 0; i--) {
      digits[`${digitsAbove.length-i-1}`] = Number(digitsAbove.charAt(i));
  }
  for (let i = 0; i < digitsBelow.length; i++) {
      digits[`${-(i+1)}`] = Number(digitsBelow.charAt(i));
  }

  digits.topPos = digitsAbove.length-1;
  digits.bottomPos = -digitsBelow.length;

  digits.get = (pos) => { return digits[`${pos}`] }
  digits.set = (pos, newDigit) => { digits[`${pos}`] = newDigit }
  digits.increment = (pos) => { 
      let currentDigit = digits.get(pos);
      if (currentDigit === undefined) {
          digits.set(pos, 1);
          digits.topPos++;
      } else {
          if (currentDigit === 9) {
              digits.set(pos, 0);
              digits.increment(pos+1);
          } else {
              digits.set(pos, currentDigit+1);
          }
      }
      return digits;
  }
  digits.iterate = (from, to, func) => {
      for (let pos = from; pos >= to; pos--) {
          func(pos);
      }
  }
  digits.round = (desiredRoundingPos) => {
      if (desiredRoundingPos < digits.bottomPos) return digits;
      
      // Never round integers 
      let roundingPos = desiredRoundingPos < 0 ? desiredRoundingPos : 0;

      // round up if above previous number is 5 or above 
      if (digits.get(roundingPos-1) >= 5) {
          digits.increment(roundingPos);
      }

      // clear digits below the rounding position 
      digits.iterate(roundingPos-1, digits.bottomPos, (pos) => {
          delete digits[`${pos}`];
      });
      digits.bottomPos = roundingPos;

      return digits;
  }
  digits.toString = () => {
      let result = "";
      digits.iterate(digits.topPos, digits.bottomPos, (pos) => {
          if(pos == -1) {
              result += ".";
          }
          result += `${digits.get(pos)}`;
      })
      return result;
  }

  digits.toAboveBelowFormat = () => {
      let digits_above = "";
      let digits_below = "";
      digits.iterate(digits.topPos, digits.bottomPos, (pos) => {
          if (pos >= 0) {
              digits_above += `${digits.get(pos)}`;
          } else {
              digits_below += `${digits.get(pos)}`;
          }
      });
      return {
          "digits_above": digits_above !== "" ? digits_above : "0",
          "digits_below": digits_below
      };
  }

  return digits;
}


/*
  positions:  4 3 2 1 0  -1-2-3-4-5-6
  digits:     8 3 4 2 5 . 4 1 0 9 8 4
              above       below
*/
function roundDigits(digits_above: string, digits_below: string, position: number) {
  return digitsObject(digits_above, digits_below).round(position).toAboveBelowFormat();
}

let default_options: FormatNumberOptions = {
  decimals: undefined,
  precision: undefined, // also called significant digits 
  round_to_zero_limit: undefined, // Rounds to zero if abs(value) < round_to_zero_limit and round_to_zero_limit is defined
  use_e_format_upper_limit: 1e8, 
  use_e_format_lower_limit: 1e-6, 
  show_plus_sign: false,
  not_defined: "" // return if value is not defined 
}
type FormatNumberOptions = {
  decimals?: number,
  precision?: number, // also called significant digits 
  round_to_zero_limit?: number, // Rounds to zero if abs(value) < round_to_zero_limit and round_to_zero_limit is defined
  use_e_format_upper_limit?: number,
  use_e_format_lower_limit?: number,
  show_plus_sign?: false,
  not_defined?: "" // return if value is not defined 
}

/* replaces format_number */
export function formatNumber(value: number, options: FormatNumberOptions = {}) {
  for (let key of Object.keys(default_options) as (keyof FormatNumberOptions)[]) {
      if((options)[key] === undefined) {
          options[key] = default_options[key] as any;
      }
  }

  if (value === null || value === undefined) {
      return options.not_defined;
  }

  // set as zero if 0 or below rounding limit 
  if(value === 0 || (! isNaN(Number(options.round_to_zero_limit)) && Math.abs(value) <= options.round_to_zero_limit!)) {
      return "0";
  }
  let log = Math.log10(Math.abs(value));
  let exponent = Math.floor(log);

  // exponent rounded of to nerest 3 divisible number: ...-6, -3, 0, 3, 6,...
  let exp3 = roundExponent(exponent);

  let selectedExp = 0;
  if ((Math.abs(value) >= options.use_e_format_upper_limit!) ||
      (Math.abs(value) <= options.use_e_format_lower_limit!)) {
      selectedExp = exp3;
  }

  let digits_above = "";
  let digits_below = "";
  let rest = Math.abs(value);
  for (let i = selectedExp; i > selectedExp-10; i--) {
      let tmpNum = Math.floor(rest/(10**i));
      if (i === selectedExp) {
          // NOTE: for numbers above 1e21 this will turn into e-format by the tostring method
          digits_above += `${tmpNum}`;
      } else {
          digits_below += `${tmpNum}`;
      }
      rest -= tmpNum*10**i;
      rest = rest < 0 ? 0 : rest;
  }
  
  // set sign character 
  let sign_str = options.show_plus_sign ? "+" : "";
  sign_str = value < 0 ? "-": sign_str;

  // determine decimals/precision
  if (! isNaN(Number(options.decimals))) {
      let ans = roundDigits(digits_above, digits_below, -options.decimals!);
      digits_above = ans.digits_above;
      digits_below = ans.digits_below;
  } else if (! isNaN(Number(options.precision))) {
      let leading_zeros = 0;
      for (let d of digits_above.concat(digits_below)) { 
          if (d === "0") { 
              leading_zeros++; 
          } else {
              break;
          }
      }
      let ans = roundDigits(digits_above, digits_below, digits_above.length-options.precision!-leading_zeros);
      digits_above = ans.digits_above;
      digits_below = ans.digits_below;
  } else {
      // default: clean up zeros at end
      while(digits_below[digits_below.length-1] === "0") {
          digits_below = digits_below.substr(0, digits_below.length-1);
      }
  }
  let result = `${sign_str}${digits_above}`;
  if (digits_below.length !== 0) {
      result += `.${digits_below}`;
  }
  
  if (selectedExp !== 0) {
      // show as e-format 
      result = `${result}e${Math.sign(selectedExp) === 1 ? "+": "-" }${Math.abs(selectedExp)}`;
  }
  return result;
}


/* replaces decimals_in_value_string */
export function decimalsInValueString(value: string) {
  if (isNaN(Number(value))) {
      return null;
  }

  // e-format numbers 
  // NOTE: not accurate number of decimals for e-format numbers 
  let decimals = 0;
  if (value.includes("e")) {
      for (let i = 0; value[i] !== "e"; i++) {
          if (! isNaN(Number(value[i]))) {
              decimals++;
          }
      }
      return decimals;
  }

  // normal numbers
  let splt = value.split('.');

  if (splt.length < 2) {
      return 0;
  } 
  let decimals_str = splt[1];
  decimals = decimals_str.length;

  let trailing_zeros = 0;
  for(let i = decimals-1; i >= 0; i--) {
      if (decimals_str[i] === "0") {
          trailing_zeros++;
      } else {
          break;
      }
  }

  return decimals-trailing_zeros;
}