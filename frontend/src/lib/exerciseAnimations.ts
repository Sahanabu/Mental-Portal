export const exerciseAnimations = {
  // Breathing exercises
  'breathing': '/exercises/6HiHHe0.gif',
  'calming-breath': '/exercises/6HiHHe0.gif',
  'energizing-breath': '/exercises/6HiHHe0.gif',
  'stress-relief-breath': '/exercises/6HiHHe0.gif',
  'uplifting-breath': '/exercises/6HiHHe0.gif',
  'balanced-breath': '/exercises/6HiHHe0.gif',
  
  // Stretching exercises
  'shoulder-release': '/exercises/7inpWch.gif',
  'neck-shoulder-stretch': '/exercises/7inpWch.gif',
  'victory-stretch': '/exercises/8xUv4J7.gif',
  'heart-opener': '/exercises/8xUv4J7.gif',
  'full-body-stretch': '/exercises/8xUv4J7.gif',
  'gentle-stretch': '/exercises/7inpWch.gif',
  
  // Physical exercises
  'power-squats': '/exercises/2Qh2J1e.gif',
  'gentle-walk': '/exercises/3eGE2JC.gif',
  'light-movement': '/exercises/3eGE2JC.gif',
  'wall-push-ups': '/exercises/4dF3maG.gif',
  'light-jumping-jacks': '/exercises/5bpPTHv.gif',
  'light-activity': '/exercises/3eGE2JC.gif',
  'situps': '/exercises/6sMAmNv.gif',
  'crunches': '/exercises/6sMAmNv.gif',
};

export const getExerciseAnimation = (title: string): string => {
  const key = title.toLowerCase().replace(/\s+/g, '-');
  return exerciseAnimations[key as keyof typeof exerciseAnimations] || '/exercises/6HiHHe0.gif';
};
