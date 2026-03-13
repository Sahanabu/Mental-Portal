exports.getResources = (req, res) => {
  const resources = [
    {
      name: 'National Suicide Prevention Lifeline',
      phone: '988',
      description: '24/7 free and confidential support',
      country: 'USA'
    },
    {
      name: 'Crisis Text Line',
      contact: 'Text HOME to 741741',
      description: 'Free 24/7 crisis support via text',
      country: 'USA'
    },
    {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      description: 'Treatment referral and information service',
      country: 'USA'
    },
    {
      name: 'International Association for Suicide Prevention',
      website: 'https://www.iasp.info/resources/Crisis_Centres/',
      description: 'Global crisis centers directory'
    },
    {
      name: 'Mental Health America',
      website: 'https://www.mhanational.org',
      description: 'Mental health resources and screening tools'
    },
    {
      name: 'NAMI (National Alliance on Mental Illness)',
      phone: '1-800-950-6264',
      description: 'Support and education for mental health',
      country: 'USA'
    }
  ];

  res.json({ resources });
};
