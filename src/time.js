
import parse from 'date-fns/parse';

export function getNormalizedTime(message) {
  let r = /^(\d{1,2}):(\d{1,2})(?:[\.,:](\d{1,3}))?$/;
  var match = message.match(r);
  if (match == null) return null;

  var m = match[1];
  var s = match[2];
  var ms = match[3] || "999";

  // Pad s with zeroes
  while (s.length < 2) {
    s = "0" + s;
  }

  // Pad ms with nines
  while (ms.length < 3) {
    ms += "9";
  }

  if (parseInt(s) > 59) throw new ValidationError("Seconds out of bounds");
  if (parseInt(m) > 59) throw new ValidationError("Minutes out of bounds");

  return m + ":" + s + "." + ms;
}