const KLAUSUR_PROBLEMS = [
  {
    "id": "A1",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\left(\\left(\\sqrt{x}\\right)^{\\sqrt{3}}\\right)^{\\sqrt{3}}",
    "question": "= x^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 3,
        "den": 2
      }
    ],
    "steps": [
      {
        "left": "\\left(\\sqrt{x}\\right)^{\\sqrt{3}} = x^{\\frac{\\sqrt{3}}{2}}",
        "right": "Wurzel = Exponent 1/k"
      },
      {
        "left": "\\left(x^{\\frac{\\sqrt{3}}{2}}\\right)^{\\sqrt{3}} = x^{\\frac{\\sqrt{3}\\cdot\\sqrt{3}}{2}}",
        "right": "Potenz einer Potenz"
      },
      {
        "left": "\\sqrt{3}\\cdot\\sqrt{3} = 3",
        "right": ""
      },
      {
        "left": "= x^{\\frac{3}{2}}",
        "right": ""
      }
    ]
  },
  {
    "id": "A2",
    "tier": 1,
    "vars": [
      "a"
    ],
    "prompt": "\\left(\\left(\\sqrt[4]{a}\\right)^{\\sqrt{5}}\\right)^{\\sqrt{5}}",
    "question": "= a^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 5,
        "den": 4
      }
    ],
    "steps": [
      {
        "left": "\\left(\\sqrt[4]{a}\\right)^{\\sqrt{5}} = a^{\\frac{\\sqrt{5}}{4}}",
        "right": "Wurzel = Exponent 1/k"
      },
      {
        "left": "\\left(a^{\\frac{\\sqrt{5}}{4}}\\right)^{\\sqrt{5}} = a^{\\frac{\\sqrt{5}\\cdot\\sqrt{5}}{4}}",
        "right": "Potenz einer Potenz"
      },
      {
        "left": "\\sqrt{5}\\cdot\\sqrt{5} = 5",
        "right": ""
      },
      {
        "left": "= a^{\\frac{5}{4}}",
        "right": ""
      }
    ]
  },
  {
    "id": "B1",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\sqrt{\\sqrt{x^{3}}}",
    "question": "= x^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 3,
        "den": 4
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{x^{3}} = x^{\\frac{3}{2}}",
        "right": "innere Wurzel"
      },
      {
        "left": "\\sqrt{x^{\\frac{3}{2}}} = x^{\\frac{3}{2\\cdot 2}}",
        "right": "äußere Wurzel"
      },
      {
        "left": "= x^{\\frac{3}{4}}",
        "right": ""
      }
    ]
  },
  {
    "id": "B2",
    "tier": 1,
    "vars": [
      "a"
    ],
    "prompt": "\\sqrt[3]{\\sqrt{a^{5}}}",
    "question": "= a^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 5,
        "den": 6
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{a^{5}} = a^{\\frac{5}{2}}",
        "right": "innere Wurzel"
      },
      {
        "left": "\\sqrt[3]{a^{\\frac{5}{2}}} = a^{\\frac{5}{2\\cdot 3}}",
        "right": "äußere Wurzel"
      },
      {
        "left": "= a^{\\frac{5}{6}}",
        "right": ""
      }
    ]
  },
  {
    "id": "C1",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\dfrac{x^{3}}{\\sqrt{x^{1}}}",
    "question": "= x^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 5,
        "den": 2
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{x^{1}} = x^{\\frac{1}{2}}",
        "right": "Wurzel umschreiben"
      },
      {
        "left": "\\dfrac{x^{3}}{x^{\\frac{1}{2}}} = x^{3-\\frac{1}{2}}",
        "right": "Exponenten subtrahieren"
      },
      {
        "left": "= x^{\\frac{6-1}{2}} = x^{\\frac{5}{2}}",
        "right": ""
      }
    ]
  },
  {
    "id": "C2",
    "tier": 1,
    "vars": [
      "a"
    ],
    "prompt": "\\dfrac{a^{5}}{\\sqrt[3]{a^{4}}}",
    "question": "= a^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 11,
        "den": 3
      }
    ],
    "steps": [
      {
        "left": "\\sqrt[3]{a^{4}} = a^{\\frac{4}{3}}",
        "right": "Wurzel umschreiben"
      },
      {
        "left": "\\dfrac{a^{5}}{a^{\\frac{4}{3}}} = a^{5-\\frac{4}{3}}",
        "right": "Exponenten subtrahieren"
      },
      {
        "left": "= a^{\\frac{15-4}{3}} = a^{\\frac{11}{3}}",
        "right": ""
      }
    ]
  },
  {
    "id": "I1",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\sqrt{x^{2}} - 2\\cdot \\sqrt[3]{x^{3}}",
    "question": "\\text{Vereinfache zu einem einzigen Term}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent (Bruch oder Zahl)"
    ],
    "answer": [
      -1,
      {
        "num": 1,
        "den": 1
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{x^{2}} = x^{1}",
        "right": "1. Term umschreiben"
      },
      {
        "left": "\\sqrt[3]{x^{3}} = x^{1}",
        "right": "2. Term umschreiben -- gleicher Exponent!"
      },
      {
        "left": "x^{1} - 2\\cdot x^{1} = (1-2)\\,x^{1}",
        "right": "zusammenfassen"
      },
      {
        "left": "= -1\\,x^{1}",
        "right": ""
      }
    ]
  },
  {
    "id": "I2",
    "tier": 1,
    "vars": [
      "a"
    ],
    "prompt": "\\sqrt[3]{a^{6}} - 3\\cdot \\sqrt{a^{4}}",
    "question": "\\text{Vereinfache zu einem einzigen Term}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent (Bruch oder Zahl)"
    ],
    "answer": [
      -2,
      {
        "num": 2,
        "den": 1
      }
    ],
    "steps": [
      {
        "left": "\\sqrt[3]{a^{6}} = a^{2}",
        "right": "1. Term umschreiben"
      },
      {
        "left": "\\sqrt{a^{4}} = a^{2}",
        "right": "2. Term umschreiben -- gleicher Exponent!"
      },
      {
        "left": "a^{2} - 3\\cdot a^{2} = (1-3)\\,a^{2}",
        "right": "zusammenfassen"
      },
      {
        "left": "= -2\\,a^{2}",
        "right": ""
      }
    ]
  },
  {
    "id": "I3",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\sqrt{x^{3}} - 2\\cdot \\sqrt[4]{x^{6}}",
    "question": "\\text{Vereinfache zu einem einzigen Term}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent (Bruch oder Zahl)"
    ],
    "answer": [
      -1,
      {
        "num": 3,
        "den": 2
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{x^{3}} = x^{\\frac{3}{2}}",
        "right": "1. Term umschreiben"
      },
      {
        "left": "\\sqrt[4]{x^{6}} = x^{\\frac{3}{2}}",
        "right": "2. Term umschreiben -- gleicher Exponent!"
      },
      {
        "left": "x^{\\frac{3}{2}} - 2\\cdot x^{\\frac{3}{2}} = (1-2)\\,x^{\\frac{3}{2}}",
        "right": "zusammenfassen"
      },
      {
        "left": "= -1\\,x^{\\frac{3}{2}}",
        "right": ""
      }
    ]
  },
  {
    "id": "I4",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\sqrt[4]{x^{8}} + 4\\cdot \\sqrt{x^{4}}",
    "question": "\\text{Vereinfache zu einem einzigen Term}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent (Bruch oder Zahl)"
    ],
    "answer": [
      5,
      {
        "num": 2,
        "den": 1
      }
    ],
    "steps": [
      {
        "left": "\\sqrt[4]{x^{8}} = x^{2}",
        "right": "1. Term umschreiben"
      },
      {
        "left": "\\sqrt{x^{4}} = x^{2}",
        "right": "2. Term umschreiben -- gleicher Exponent!"
      },
      {
        "left": "x^{2} + 4\\cdot x^{2} = (1+4)\\,x^{2}",
        "right": "zusammenfassen"
      },
      {
        "left": "= 5\\,x^{2}",
        "right": ""
      }
    ]
  },
  {
    "id": "I5",
    "tier": 1,
    "vars": [
      "a"
    ],
    "prompt": "\\sqrt[3]{a^{3}} - 5\\cdot \\sqrt[6]{a^{6}}",
    "question": "\\text{Vereinfache zu einem einzigen Term}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent (Bruch oder Zahl)"
    ],
    "answer": [
      -4,
      {
        "num": 1,
        "den": 1
      }
    ],
    "steps": [
      {
        "left": "\\sqrt[3]{a^{3}} = a^{1}",
        "right": "1. Term umschreiben"
      },
      {
        "left": "\\sqrt[6]{a^{6}} = a^{1}",
        "right": "2. Term umschreiben -- gleicher Exponent!"
      },
      {
        "left": "a^{1} - 5\\cdot a^{1} = (1-5)\\,a^{1}",
        "right": "zusammenfassen"
      },
      {
        "left": "= -4\\,a^{1}",
        "right": ""
      }
    ]
  },
  {
    "id": "I6",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\sqrt{x^{5}} + 3\\cdot \\sqrt[4]{x^{10}}",
    "question": "\\text{Vereinfache zu einem einzigen Term}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent (Bruch oder Zahl)"
    ],
    "answer": [
      4,
      {
        "num": 5,
        "den": 2
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{x^{5}} = x^{\\frac{5}{2}}",
        "right": "1. Term umschreiben"
      },
      {
        "left": "\\sqrt[4]{x^{10}} = x^{\\frac{5}{2}}",
        "right": "2. Term umschreiben -- gleicher Exponent!"
      },
      {
        "left": "x^{\\frac{5}{2}} + 3\\cdot x^{\\frac{5}{2}} = (1+3)\\,x^{\\frac{5}{2}}",
        "right": "zusammenfassen"
      },
      {
        "left": "= 4\\,x^{\\frac{5}{2}}",
        "right": ""
      }
    ]
  },
  {
    "id": "J1",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\sqrt{\\sqrt{\\sqrt{x^{5}}}}",
    "question": "= x^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 5,
        "den": 8
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{x^{5}} = x^{\\frac{5}{2}}",
        "right": "innerste Wurzel"
      },
      {
        "left": "\\sqrt{x^{\\frac{5}{2}}} = x^{\\frac{5}{2\\cdot 2}}",
        "right": "mittlere Wurzel"
      },
      {
        "left": "\\sqrt{x^{\\frac{5}{4}}} = x^{\\frac{5}{8}}",
        "right": "äußerste Wurzel"
      },
      {
        "left": "= x^{\\frac{5}{8}}",
        "right": ""
      }
    ]
  },
  {
    "id": "J2",
    "tier": 1,
    "vars": [
      "a"
    ],
    "prompt": "\\sqrt[3]{\\sqrt{\\sqrt{a^{7}}}}",
    "question": "= a^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 7,
        "den": 12
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{a^{7}} = a^{\\frac{7}{2}}",
        "right": "innerste Wurzel"
      },
      {
        "left": "\\sqrt{a^{\\frac{7}{2}}} = a^{\\frac{7}{2\\cdot 2}}",
        "right": "mittlere Wurzel"
      },
      {
        "left": "\\sqrt[3]{a^{\\frac{7}{4}}} = a^{\\frac{7}{12}}",
        "right": "äußerste Wurzel"
      },
      {
        "left": "= a^{\\frac{7}{12}}",
        "right": ""
      }
    ]
  },
  {
    "id": "J3",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\sqrt{\\sqrt[3]{\\sqrt{x^{11}}}}",
    "question": "= x^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 11,
        "den": 12
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{x^{11}} = x^{\\frac{11}{2}}",
        "right": "innerste Wurzel"
      },
      {
        "left": "\\sqrt[3]{x^{\\frac{11}{2}}} = x^{\\frac{11}{2\\cdot 3}}",
        "right": "mittlere Wurzel"
      },
      {
        "left": "\\sqrt{x^{\\frac{11}{6}}} = x^{\\frac{11}{12}}",
        "right": "äußerste Wurzel"
      },
      {
        "left": "= x^{\\frac{11}{12}}",
        "right": ""
      }
    ]
  },
  {
    "id": "J4",
    "tier": 1,
    "vars": [
      "a"
    ],
    "prompt": "\\sqrt{\\sqrt{\\sqrt[3]{a^{13}}}}",
    "question": "= a^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 13,
        "den": 12
      }
    ],
    "steps": [
      {
        "left": "\\sqrt[3]{a^{13}} = a^{\\frac{13}{3}}",
        "right": "innerste Wurzel"
      },
      {
        "left": "\\sqrt{a^{\\frac{13}{3}}} = a^{\\frac{13}{3\\cdot 2}}",
        "right": "mittlere Wurzel"
      },
      {
        "left": "\\sqrt{a^{\\frac{13}{6}}} = a^{\\frac{13}{12}}",
        "right": "äußerste Wurzel"
      },
      {
        "left": "= a^{\\frac{13}{12}}",
        "right": ""
      }
    ]
  },
  {
    "id": "K1",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\sqrt{x^{1}}\\cdot \\sqrt[3]{x^{1}}",
    "question": "= x^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 5,
        "den": 6
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{x^{1}} = x^{\\frac{1}{2}}\\,, \\quad \\sqrt[3]{x^{1}} = x^{\\frac{1}{3}}",
        "right": "beide Wurzeln umschreiben"
      },
      {
        "left": "x^{\\frac{1}{2}}\\cdot x^{\\frac{1}{3}} = x^{\\frac{1}{2}+\\frac{1}{3}}",
        "right": "gleiche Basis: Exponenten addieren"
      },
      {
        "left": "\\frac{1}{2}+\\frac{1}{3} = \\frac{5}{6}",
        "right": "Brüche addieren"
      },
      {
        "left": "= x^{\\frac{5}{6}}",
        "right": ""
      }
    ]
  },
  {
    "id": "K2",
    "tier": 1,
    "vars": [
      "a"
    ],
    "prompt": "\\sqrt[3]{a^{2}}\\cdot \\sqrt{a^{1}}",
    "question": "= a^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 7,
        "den": 6
      }
    ],
    "steps": [
      {
        "left": "\\sqrt[3]{a^{2}} = a^{\\frac{2}{3}}\\,, \\quad \\sqrt{a^{1}} = a^{\\frac{1}{2}}",
        "right": "beide Wurzeln umschreiben"
      },
      {
        "left": "a^{\\frac{2}{3}}\\cdot a^{\\frac{1}{2}} = a^{\\frac{2}{3}+\\frac{1}{2}}",
        "right": "gleiche Basis: Exponenten addieren"
      },
      {
        "left": "\\frac{2}{3}+\\frac{1}{2} = \\frac{7}{6}",
        "right": "Brüche addieren"
      },
      {
        "left": "= a^{\\frac{7}{6}}",
        "right": ""
      }
    ]
  },
  {
    "id": "K3",
    "tier": 1,
    "vars": [
      "x"
    ],
    "prompt": "\\sqrt[4]{x^{1}}\\cdot \\sqrt{x^{3}}",
    "question": "= x^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 7,
        "den": 4
      }
    ],
    "steps": [
      {
        "left": "\\sqrt[4]{x^{1}} = x^{\\frac{1}{4}}\\,, \\quad \\sqrt{x^{3}} = x^{\\frac{3}{2}}",
        "right": "beide Wurzeln umschreiben"
      },
      {
        "left": "x^{\\frac{1}{4}}\\cdot x^{\\frac{3}{2}} = x^{\\frac{1}{4}+\\frac{3}{2}}",
        "right": "gleiche Basis: Exponenten addieren"
      },
      {
        "left": "\\frac{1}{4}+\\frac{3}{2} = \\frac{7}{4}",
        "right": "Brüche addieren"
      },
      {
        "left": "= x^{\\frac{7}{4}}",
        "right": ""
      }
    ]
  },
  {
    "id": "K4",
    "tier": 1,
    "vars": [
      "a"
    ],
    "prompt": "\\sqrt{a^{3}}\\cdot \\sqrt[3]{a^{1}}",
    "question": "= a^{\\;?}",
    "fieldLabels": [
      "Exponent (Bruch oder Zahl)"
    ],
    "answerType": "fraction",
    "answer": [
      {
        "num": 11,
        "den": 6
      }
    ],
    "steps": [
      {
        "left": "\\sqrt{a^{3}} = a^{\\frac{3}{2}}\\,, \\quad \\sqrt[3]{a^{1}} = a^{\\frac{1}{3}}",
        "right": "beide Wurzeln umschreiben"
      },
      {
        "left": "a^{\\frac{3}{2}}\\cdot a^{\\frac{1}{3}} = a^{\\frac{3}{2}+\\frac{1}{3}}",
        "right": "gleiche Basis: Exponenten addieren"
      },
      {
        "left": "\\frac{3}{2}+\\frac{1}{3} = \\frac{11}{6}",
        "right": "Brüche addieren"
      },
      {
        "left": "= a^{\\frac{11}{6}}",
        "right": ""
      }
    ]
  },
  {
    "id": "D1",
    "tier": 2,
    "vars": [
      "x"
    ],
    "prompt": "\\left(2x^{3}\\right)^{2}\\cdot\\left(3x^{4}\\right)^{2}",
    "question": "\\text{Vereinfache: Koeffizient und Exponent}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent"
    ],
    "answer": [
      36,
      14
    ],
    "steps": [
      {
        "left": "\\left(2x^{3}\\right)^{2} = 4x^{6}",
        "right": ""
      },
      {
        "left": "\\left(3x^{4}\\right)^{2} = 9x^{8}",
        "right": ""
      },
      {
        "left": "\\Rightarrow 36\\,x^{14}",
        "right": "Koeffizienten multiplizieren, Exponenten addieren"
      }
    ]
  },
  {
    "id": "D2",
    "tier": 2,
    "vars": [
      "a"
    ],
    "prompt": "\\left(3a^{2}\\right)^{2}\\cdot\\left(4a^{3}\\right)^{2}",
    "question": "\\text{Vereinfache: Koeffizient und Exponent}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent"
    ],
    "answer": [
      144,
      10
    ],
    "steps": [
      {
        "left": "\\left(3a^{2}\\right)^{2} = 9a^{4}",
        "right": ""
      },
      {
        "left": "\\left(4a^{3}\\right)^{2} = 16a^{6}",
        "right": ""
      },
      {
        "left": "\\Rightarrow 144\\,a^{10}",
        "right": "Koeffizienten multiplizieren, Exponenten addieren"
      }
    ]
  },
  {
    "id": "E1",
    "tier": 2,
    "vars": [
      "x"
    ],
    "prompt": "\\dfrac{\\left(4x^{2}\\right)^{2}}{\\left(2x^{3}\\right)^{2}}",
    "question": "\\text{Vereinfache: Koeffizient und Exponent}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent"
    ],
    "answer": [
      4,
      -2
    ],
    "steps": [
      {
        "left": "\\left(4x^{2}\\right)^{2} = 16x^{4}",
        "right": ""
      },
      {
        "left": "\\left(2x^{3}\\right)^{2} = 4x^{6}",
        "right": ""
      },
      {
        "left": "\\dfrac{16x^{4}}{4x^{6}} = \\dfrac{16}{4}x^{-2}",
        "right": "kürzen / Exponenten subtrahieren"
      }
    ]
  },
  {
    "id": "E2",
    "tier": 2,
    "vars": [
      "a"
    ],
    "prompt": "\\dfrac{\\left(9a^{2}\\right)^{2}}{\\left(3a^{3}\\right)^{1}}",
    "question": "\\text{Vereinfache: Koeffizient und Exponent}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent"
    ],
    "answer": [
      27,
      1
    ],
    "steps": [
      {
        "left": "\\left(9a^{2}\\right)^{2} = 81a^{4}",
        "right": ""
      },
      {
        "left": "\\left(3a^{3}\\right)^{1} = 3a^{3}",
        "right": ""
      },
      {
        "left": "\\dfrac{81a^{4}}{3a^{3}} = \\dfrac{81}{3}a^{1}",
        "right": "kürzen / Exponenten subtrahieren"
      }
    ]
  },
  {
    "id": "F1",
    "tier": 2,
    "vars": [
      "x",
      "y"
    ],
    "prompt": "\\left(2x^{2}y^{1}\\right)^{2}\\cdot\\left(3x^{1}y^{2}\\right)^{2}",
    "question": "\\text{Vereinfache: Koeffizient, Exponent von x, Exponent von y}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent von x",
      "Exponent von y"
    ],
    "answer": [
      36,
      6,
      6
    ],
    "steps": [
      {
        "left": "\\left(2x^{2}y^{1}\\right)^{2} = 4x^{4}y^{2}",
        "right": ""
      },
      {
        "left": "\\left(3x^{1}y^{2}\\right)^{2} = 9x^{2}y^{4}",
        "right": ""
      },
      {
        "left": "\\Rightarrow 36\\,x^{6}y^{6}",
        "right": "Koeffizienten multiplizieren, Exponenten je Basis addieren"
      }
    ]
  },
  {
    "id": "F2",
    "tier": 2,
    "vars": [
      "x",
      "y"
    ],
    "prompt": "\\left(3x^{1}y^{2}\\right)^{3}\\cdot\\left(2x^{2}y^{1}\\right)^{2}",
    "question": "\\text{Vereinfache: Koeffizient, Exponent von x, Exponent von y}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent von x",
      "Exponent von y"
    ],
    "answer": [
      108,
      7,
      8
    ],
    "steps": [
      {
        "left": "\\left(3x^{1}y^{2}\\right)^{3} = 27x^{3}y^{6}",
        "right": ""
      },
      {
        "left": "\\left(2x^{2}y^{1}\\right)^{2} = 4x^{4}y^{2}",
        "right": ""
      },
      {
        "left": "\\Rightarrow 108\\,x^{7}y^{8}",
        "right": "Koeffizienten multiplizieren, Exponenten je Basis addieren"
      }
    ]
  },
  {
    "id": "M1",
    "tier": 2,
    "vars": [
      "x"
    ],
    "prompt": "\\left(2x^{3}\\right)^{2} + \\left(3x^{2}\\right)^{3}",
    "question": "\\text{Vereinfache: Koeffizient und Exponent}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent"
    ],
    "answer": [
      31,
      6
    ],
    "steps": [
      {
        "left": "\\left(2x^{3}\\right)^{2} = 4x^{6}",
        "right": "1. Term"
      },
      {
        "left": "\\left(3x^{2}\\right)^{3} = 27x^{6}",
        "right": "2. Term -- gleicher Exponent!"
      },
      {
        "left": "4x^{6} + 27x^{6} = 31\\,x^{6}",
        "right": "zusammenfassen"
      }
    ]
  },
  {
    "id": "M2",
    "tier": 2,
    "vars": [
      "a"
    ],
    "prompt": "\\left(3a^{2}\\right)^{2} - \\left(2a^{4}\\right)^{1}",
    "question": "\\text{Vereinfache: Koeffizient und Exponent}",
    "fieldLabels": [
      "Koeffizient",
      "Exponent"
    ],
    "answer": [
      7,
      4
    ],
    "steps": [
      {
        "left": "\\left(3a^{2}\\right)^{2} = 9a^{4}",
        "right": "1. Term"
      },
      {
        "left": "\\left(2a^{4}\\right)^{1} = 2a^{4}",
        "right": "2. Term -- gleicher Exponent!"
      },
      {
        "left": "9a^{4} - 2a^{4} = 7\\,a^{4}",
        "right": "zusammenfassen"
      }
    ]
  },
  {
    "id": "G1",
    "tier": 3,
    "vars": [],
    "prompt": "\\left((-1)^{4n} - (-1)^{4n+1}\\right)^{3}",
    "question": "\\text{(gilt für jede ganze Zahl } n\\text{) = ?}",
    "fieldLabels": [
      "Ergebnis (Zahl)"
    ],
    "answer": [
      8
    ],
    "steps": [
      {
        "left": "4n \\text{ ist für jedes } n \\text{ gerade}",
        "right": "4 \\text{ gerade}"
      },
      {
        "left": "(-1)^{4n} = 1\\,, \\quad (-1)^{4n+1} = -1",
        "right": ""
      },
      {
        "left": "(1-(-1))^{3} = 2^{3}",
        "right": ""
      },
      {
        "left": "= 8",
        "right": ""
      }
    ]
  },
  {
    "id": "G2",
    "tier": 3,
    "vars": [],
    "prompt": "\\left((-1)^{6n} - (-1)^{6n+1}\\right)^{4}",
    "question": "\\text{(gilt für jede ganze Zahl } n\\text{) = ?}",
    "fieldLabels": [
      "Ergebnis (Zahl)"
    ],
    "answer": [
      16
    ],
    "steps": [
      {
        "left": "6n \\text{ ist für jedes } n \\text{ gerade}",
        "right": "6 \\text{ gerade}"
      },
      {
        "left": "(-1)^{6n} = 1\\,, \\quad (-1)^{6n+1} = -1",
        "right": ""
      },
      {
        "left": "(1-(-1))^{4} = 2^{4}",
        "right": ""
      },
      {
        "left": "= 16",
        "right": ""
      }
    ]
  },
  {
    "id": "H1",
    "tier": 3,
    "vars": [
      "x",
      "y",
      "z"
    ],
    "prompt": "\\left(\\dfrac{9x^{2}}{25y^{1}}\\right)^{2}\\cdot\\left(\\dfrac{16y^{1}}{27z^{4}}\\right)^{3}\\cdot\\left(\\dfrac{8x^{1}}{15z^{3}}\\right)^{-4}",
    "question": "\\text{Vereinfache: Koeffizient, Exponent von x, y, z}",
    "fieldLabels": [
      "Koeffizient (Bruch)",
      "Exponent von x",
      "Exponent von y",
      "Exponent von z"
    ],
    "answer": [
      {
        "num": 1,
        "den": 3
      },
      0,
      1,
      0
    ],
    "steps": [
      {
        "left": "\\left(\\dfrac{9x^{2}}{25y^{1}}\\right)^{2} = \\dfrac{81}{625}x^{4}y^{-2}",
        "right": "1. Faktor"
      },
      {
        "left": "\\left(\\dfrac{16y^{1}}{27z^{4}}\\right)^{3} = \\dfrac{4096}{19683}y^{3}z^{-12}",
        "right": "2. Faktor"
      },
      {
        "left": "\\left(\\dfrac{8x^{1}}{15z^{3}}\\right)^{-4} = \\dfrac{0.000244140625}{0.000019753086419753087}x^{-4}z^{12}",
        "right": "3. Faktor"
      },
      {
        "left": "\\Rightarrow \\dfrac{81}{243}\\,x^{0}y^{1}z^{0}",
        "right": "alles zusammenfassen"
      }
    ]
  },
  {
    "id": "H2",
    "tier": 3,
    "vars": [
      "x",
      "y",
      "z"
    ],
    "prompt": "\\left(\\dfrac{4x^{2}}{9y^{2}}\\right)^{2}\\cdot\\left(\\dfrac{8y^{3}}{27z^{3}}\\right)^{2}\\cdot\\left(\\dfrac{2x^{1}}{5z^{1}}\\right)^{-2}",
    "question": "\\text{Vereinfache: Koeffizient, Exponent von x, y, z}",
    "fieldLabels": [
      "Koeffizient (Bruch)",
      "Exponent von x",
      "Exponent von y",
      "Exponent von z"
    ],
    "answer": [
      {
        "num": 281474976710656,
        "den": 2597002484341801
      },
      2,
      2,
      -4
    ],
    "steps": [
      {
        "left": "\\left(\\dfrac{4x^{2}}{9y^{2}}\\right)^{2} = \\dfrac{16}{81}x^{4}y^{-4}",
        "right": "1. Faktor"
      },
      {
        "left": "\\left(\\dfrac{8y^{3}}{27z^{3}}\\right)^{2} = \\dfrac{64}{729}y^{6}z^{-6}",
        "right": "2. Faktor"
      },
      {
        "left": "\\left(\\dfrac{2x^{1}}{5z^{1}}\\right)^{-2} = \\dfrac{0.25}{0.04}x^{-2}z^{2}",
        "right": "3. Faktor"
      },
      {
        "left": "\\Rightarrow \\dfrac{256}{2361.96}\\,x^{2}y^{2}z^{-4}",
        "right": "alles zusammenfassen"
      }
    ]
  },
  {
    "id": "H3",
    "tier": 3,
    "vars": [
      "x",
      "y",
      "z"
    ],
    "prompt": "\\left(\\dfrac{2x^{1}}{3y^{1}}\\right)^{3}\\cdot\\left(\\dfrac{4y^{2}}{9z^{1}}\\right)^{-2}\\cdot\\left(\\dfrac{3x^{2}}{2z^{1}}\\right)^{2}",
    "question": "\\text{Vereinfache: Koeffizient, Exponent von x, y, z}",
    "fieldLabels": [
      "Koeffizient (Bruch)",
      "Exponent von x",
      "Exponent von y",
      "Exponent von z"
    ],
    "answer": [
      {
        "num": 2251799813685248,
        "den": 667199944795629
      },
      7,
      -7,
      0
    ],
    "steps": [
      {
        "left": "\\left(\\dfrac{2x^{1}}{3y^{1}}\\right)^{3} = \\dfrac{8}{27}x^{3}y^{-3}",
        "right": "1. Faktor"
      },
      {
        "left": "\\left(\\dfrac{4y^{2}}{9z^{1}}\\right)^{-2} = \\dfrac{0.0625}{0.012345679012345678}y^{-4}z^{2}",
        "right": "2. Faktor"
      },
      {
        "left": "\\left(\\dfrac{3x^{2}}{2z^{1}}\\right)^{2} = \\dfrac{9}{4}x^{4}z^{-2}",
        "right": "3. Faktor"
      },
      {
        "left": "\\Rightarrow \\dfrac{4.5}{1.3333333333333333}\\,x^{7}y^{-7}z^{0}",
        "right": "alles zusammenfassen"
      }
    ]
  },
  {
    "id": "H4",
    "tier": 3,
    "vars": [
      "x",
      "y",
      "z"
    ],
    "prompt": "\\left(\\dfrac{5x^{1}}{2y^{2}}\\right)^{-2}\\cdot\\left(\\dfrac{2y^{1}}{3z^{2}}\\right)^{3}\\cdot\\left(\\dfrac{3x^{1}}{4z^{1}}\\right)^{2}",
    "question": "\\text{Vereinfache: Koeffizient, Exponent von x, y, z}",
    "fieldLabels": [
      "Koeffizient (Bruch)",
      "Exponent von x",
      "Exponent von y",
      "Exponent von z"
    ],
    "answer": [
      {
        "num": 1080863910568919,
        "den": 40532396646334460
      },
      0,
      7,
      -8
    ],
    "steps": [
      {
        "left": "\\left(\\dfrac{5x^{1}}{2y^{2}}\\right)^{-2} = \\dfrac{0.04}{0.25}x^{-2}y^{4}",
        "right": "1. Faktor"
      },
      {
        "left": "\\left(\\dfrac{2y^{1}}{3z^{2}}\\right)^{3} = \\dfrac{8}{27}y^{3}z^{-6}",
        "right": "2. Faktor"
      },
      {
        "left": "\\left(\\dfrac{3x^{1}}{4z^{1}}\\right)^{2} = \\dfrac{9}{16}x^{2}z^{-2}",
        "right": "3. Faktor"
      },
      {
        "left": "\\Rightarrow \\dfrac{2.88}{108}\\,x^{0}y^{7}z^{-8}",
        "right": "alles zusammenfassen"
      }
    ]
  }
];
