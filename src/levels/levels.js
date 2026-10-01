export const levels = [
  {
    id: 1,
    name: "近距練習",
    arrows: 5,
    targets: [{ x: 620, y: 400, size: 220, motion: null }],
    wind: 0,
    starThresholds: [16, 30, 42],
  },
  {
    id: 2,
    name: "中距挑戰",
    arrows: 5,
    targets: [{ x: 830, y: 385, size: 190, motion: null }],
    wind: 0,
    starThresholds: [16, 30, 42],
  },
  {
    id: 3,
    name: "遠方移動靶",
    arrows: 6,
    targets: [
      { x: 1060, y: 360, size: 180, motion: { amplitude: 65, period: 4 } },
    ],
    wind: 0,
    starThresholds: [20, 36, 50],
  },
  {
    id: 4,
    name: "逆風試煉",
    arrows: 6,
    targets: [{ x: 850, y: 380, size: 180, motion: null }],
    wind: -65,
    starThresholds: [20, 36, 50],
  },
  {
    id: 5,
    name: "風中神射",
    arrows: 7,
    targets: [
      { x: 1080, y: 350, size: 160, motion: { amplitude: 75, period: 3.5 } },
    ],
    wind: 80,
    starThresholds: [24, 42, 60],
  },
];
