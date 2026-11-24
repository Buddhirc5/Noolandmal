// Women's body measurements (cm) for our standard sizes. Garments are cut with ease on top of these.
export const sizeChart = [
  { size: "XS", uk: "6", bust: 81, waist: 64, hip: 89 },
  { size: "S", uk: "8", bust: 86, waist: 69, hip: 94 },
  { size: "M", uk: "10", bust: 91, waist: 74, hip: 99 },
  { size: "L", uk: "12", bust: 97, waist: 79, hip: 104 },
  { size: "XL", uk: "14", bust: 102, waist: 84, hip: 109 },
  { size: "XXL", uk: "16", bust: 109, waist: 91, hip: 116 },
  { size: "3XL", uk: "18", bust: 116, waist: 99, hip: 123 },
] as const;

export const toInches = (cm: number) => (Math.round((cm / 2.54) * 2) / 2).toString();

export const howToMeasure = [
  ["Bust", "Measure around the fullest part of your bust, keeping the tape level across your back. Wear the bra you plan to wear with the dress."],
  ["Waist", "Measure around your natural waist — the narrowest part, usually just above the belly button. Keep one finger under the tape."],
  ["Hip", "Stand with your feet together and measure around the fullest part of your hips and seat."],
  ["Shoulder to hem", "For length, measure from the top of your shoulder (beside the neck) down to where you want the hem to fall."],
] as const;
