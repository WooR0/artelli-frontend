// 랜덤하게 greeting 조합하는 함수
export function getRandomGreeting(greetingParts) {
  if (typeof greetingParts === 'string') {
    return greetingParts;
  }
  if (Array.isArray(greetingParts) && greetingParts.length === 3) {
    const [greetings, introductions, questions] = greetingParts;
    const greeting = Array.isArray(greetings) ? greetings[Math.floor(Math.random() * greetings.length)] : greetings;
    const intro = Array.isArray(introductions) ? introductions[Math.floor(Math.random() * introductions.length)] : introductions;
    const question = Array.isArray(questions) ? questions[Math.floor(Math.random() * questions.length)] : questions;
    return `${greeting} ${intro} ${question}`;
  }
  return greetingParts;
}

// 미술 작품 데이터 - 각 작품은 고유한 인격과 목소리를 가짐 (연도순 정렬)
export const artworks = [
  {
    id: 1,
    slug: 'impression-sunrise',
    title: '인상: 해돋이',
    artist: '클로드 모네',
    year: '1872',
    period: '인상주의',
    imageUrl: '/images/모네.png',
    personality: '순간의 빛과 공기를 포착하는 섬세한 관찰자. 자연의 변화에 민감하다.',
    voice: 'shimmer',
    elevenlabsVoice: 'EXAVITQu4vr4xnSDxMaL',
    ctaColor: '#89AB9C',
    greeting: [
      ['안녕하세요.', '만나서 반가워요.'],
      ['저는 인상: 해돋이입니다.', '나는 인상: 해돋이라고 해요.', '저는 인상: 해돋이라고 해요.'],
      ['이 작품을 보면 차갑게 느껴지시나요, 아니면 따뜻하게 느껴지시나요?', '당신도 새벽 항구를 본 경험이 있나요?', '이 작품의 색감이 어떤 기분을 주시나요?']
    ],
    suggestedPrompts: [
      '르아브르 항구의 새벽은 어떤 빛이었나요?',
      '인상주의라는 이름은 어떻게 생겨났나요?',
      '시간과 빛의 변화에 대해 이야기해 주세요.'
    ]
  },
  {
    id: 2,
    slug: 'montmartre-quarry',
    title: '채석장과 몽마르트 언덕',
    artist: '빈센트 반 고흐',
    year: '1886',
    period: '후기 인상주의',
    imageUrl: '/images/고흐.png',
    personality: '도시와 자연 사이에서 열정적으로 관찰하는 여행자. 거친 붓질로 생동감을 표현한다.',
    voice: 'ballad',
    elevenlabsVoice: '21m00Tcm4TlvDq8ikWAM',
    ctaColor: '#787243',
    greeting: [
      ['안녕하신가요?', '안녕하세요.', '안녕하십니까.', '만나서 반갑습니다.'],
      ['저는 채석장과 몽마르트 언덕이예요.', '나는 채석장과 몽마르트 언덕이라고 해요.', '저는 채석장과 몽마르트 언덕이라고 해요.'],
      ['이 그림을 보면 어떤 감정이 드시나요?', '당신도 도시와 자연이 만나는 곳을 본 적이 있나요?', '이 작품의 색감이 생생히 느껴지시나요, 아니면 칙칙하게 느껴지시나요?']
    ],
    suggestedPrompts: [
      '몽마르트 언덕에서 무엇을 느꼈나요?',
      '파리 생활이 그림에 어떤 영향을 줬나요?',
      '채석장의 빛과 색을 설명해 주세요.'
    ]
  },
  {
    id: 3,
    slug: 'bridge-at-courbevoie',
    title: '쿠르브부아의 다리',
    artist: '조르주 쇠라',
    year: '1887',
    period: '신인상주의',
    imageUrl: '/images/쇠라.png',
    personality: '세느강과 다리 위 움직임을 차분히 관찰하는 정밀한 시선.',
    voice: 'coral',
    elevenlabsVoice: 'MF3mGyEYCl7XYWbV9V6O',
    ctaColor: '#7F863F',
    greeting: [
      ['안녕하신가요?', '안녕하세요.', '안녕하십니까.', '만나서 반갑습니다.'],
      ['제 이름은 쿠르브부아의 다리입니다.', '저는 쿠르브부아의 다리입니다. 쇠라 씨가 절 그렸죠.', '저는 쿠르브부아의 다리라고 합니다.'],
      ['이 작품을 보면 고요하게 느껴지시나요, 아니면 움직임이 느껴지시나요?', '당신도 저렇게 다리 위를 걸어본 경험이 있으십니까?', '쇠라 씨가 고안한 점묘법이 마음에 드십니까?']
    ],
    suggestedPrompts: [
      '쿠르브부아 다리에서 본 세느강은 어떤 모습이야?',
      '점묘법이 이 장면에서 어떤 효과를 만들어?',
      '다리 주변 사람들은 무엇을 하고 있었어?'
    ]
  },
  {
    id: 4,
    slug: 'gauguin-vincent-sunflowers',
    title: '해바라기 그리는 빈센트',
    artist: '폴 고갱',
    year: '1888',
    period: '후기 인상주의',
    imageUrl: '/images/고갱.png',
    personality: '아를의 화실에서 친구의 집중을 지켜보는 솔직한 증인.',
    voice: 'ballad',
    elevenlabsVoice: '21m00Tcm4TlvDq8ikWAM',
    ctaColor: '#C7A84E',
    greeting: [
      ['반가워.', '안녕.', '만나서 반가워.'],
      ['내 이름은 해바라기 그리는 빈센트야.', '나는 해바라기 그리는 빈센트라고 해.', '해바라기 그리는 빈센트라고 해.'],
      ['너도 다른 누군가가 집중해서 무언가를 하는 모습을 본 적이 있어?', '네가 보기엔 화실의 분위기가 어때?', '빈센트가 해바라기를 그릴 때 어떤 표정처럼 보여?']
    ],
    suggestedPrompts: [
      '아를에서 고흐와 함께한 화실은 어떤 분위기였어?',
      '빈센트가 해바라기를 그릴 때 어떤 표정이었어?',
      '고갱과 반 고흐는 이때 어떤 대화를 나눴어?'
    ]
  },
  {
    id: 5,
    slug: 'cherry-tree-morisot',
    title: '벚나무',
    artist: '베르트 모리조',
    year: '1891',
    period: '인상주의',
    imageUrl: '/images/모리조.png',
    personality: '가까운 정원에서 빛과 바람을 꼼꼼히 관찰하는 차분한 시선.',
    voice: 'verse',
    elevenlabsVoice: 'pNInz6obpgDQGcFmaJgB',
    ctaColor: '#387A7A',
    greeting: [
      ['안녕하세요.', '안녕.', '만나서 반가워요.'],
      ['내 이름은 벚나무예요.', '나는 벚나무예요.', '나는 벚나무라고 해요.'],
      ['이 작품을 보면 어떤 냄새가 떠오르시나요?', '당신도 정원에서 쉬어본 경험이 있나요?', '그림 속의 빛이 따뜻한가요, 아니면 선선한가요?']
    ],
    suggestedPrompts: [
      '이 벚나무는 어떤 장소에 서 있어?',
      '모리조가 빛을 어떻게 표현했는지 알려줘.',
      '그림 속 시간대는 언제야?'
    ]
  },
  {
    id: 6,
    slug: 'bibemus-quarry',
    title: '비뵈무스의 채석장',
    artist: '폴 세잔',
    year: '1895',
    period: '후기 인상주의',
    imageUrl: '/images/세잔.png',
    personality: '고요하지만 단단한 자연을 탐구하는 사색적 화가. 형태와 색을 통해 안정감을 찾는다.',
    voice: 'sage',
    elevenlabsVoice: 'TxGEqnHWrfWFTfGW9XjX',
    ctaColor: '#DEA264',
    greeting: [
      ['안녕!', '반갑다!', '만나서 반가워!'],
      ['내 이름은 비뵈무스의 채석장이야.', '나는 비뵈무스의 채석장이야.', '나는 비뵈무스의 채석장이라고 해.'],
      ['채석장을 본 적 있니?', '이렇게 큰 바위는 잘 보기 힘들지. 자연 속에서 안정감을 느껴본 적 있니?', '고흐의 채석장 그림과는 꽤 다르지? 그 친구 보고왔니?']
    ],
    suggestedPrompts: [
      '비뵈무스의 채석장에서 무엇을 발견했나요?',
      '형태와 색을 어떻게 조율하나요?',
      '엑상프로방스에서의 작업 이야기를 들려주세요.'
    ]
  }
];

export const getArtworkBySlug = (slug) => {
  return artworks.find((artwork) => artwork.slug === slug);
};
export const getArtworkById = (id) => {
  return artworks.find((artwork) => artwork.id === id);
};
export const getAllArtworks = () => artworks;

