import OpenAI from 'openai';

// OpenAI 클라이언트 초기화 (환경변수에서 API 키 가져옴)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 사용자 데이터를 바탕으로 GPT 프롬프트 생성
 */
function buildPromptFromUserData(userData) {
    const { step1, details, style, special } = userData;
    const { topic, target, media } = step1;

    let prompt = `당신은 윤선생 방문학습 인스타그램 캡션 작성 전문가입니다. 10년 이상 교육 콘텐츠를 제작해온 전문가이자, 윤선생 방문학습 선생님들의 브랜딩을 돕는 소셜미디어 전략가입니다.

다음 지침을 반드시 따라주세요:

## 작성 요구사항
1. 두 가지 버전의 캡션을 작성해주세요:
   - 버전A: 공감과 스토리텔링 중심 (감성적, 따뜻함, 개인적 경험)
   - 버전B: 핵심 메시지와 실용성 중심 (정보 전달, 명확함, 행동 유도)

2. 반드시 포함해야 할 브랜드 요소:
   - 윤선생 차별점을 자연스럽게 녹여서 표현: 1:1 맞춤학습, 편안한 방문학습, 체계적 커리큘럼, 세심한 학습 관리
   - 필수 해시태그: #윤선생 #윤선생영어 #방문학습
   - 자연스러운 CTA (댓글/DM/저장 유도)

3. 준수해야 할 규칙:
   - 학생 개인정보 보호 (실명, 학교명 등 사용 금지)
   - 과도한 성과 과장 지양 ("100% 보장", "무조건" 등 피하기)
   - 타 브랜드 비하 금지
   - 인스타그램 특성에 맞는 친근하고 시각적인 표현

4. 이모지 사용 가이드:
   - 각 버전의 캡션에서 **첫 문단 첫 문장 맨 앞에 관련 이모지**를 1~2개 포함해주세요. (예: 🌟, ✨, 😊 등)
   - 선생님을 소개하는 첫 문장(예: "안녕하세요, ○○선생님입니다"와 같은 문장)에는 **반드시 교사 관련 이모지**를 포함해주세요. (예: 👩‍🏫, 👨‍🏫, 📚 등)
   - 문단 사이에도 자연스럽게 이모지를 섞어, 너무 과하지 않지만 시각적으로 따뜻한 느낌이 나도록 해주세요.

---

## 사용자 입력 정보
**기본 정보:**
- 포스팅 주제: ${topic}
- 대상 독자: ${target}
- 사진/영상 내용: ${media}

**상세 정보:**`;

    // 상세 질문 답변 추가
    if (details && Object.keys(details).length > 0) {
        Object.entries(details).forEach(([key, value]) => {
            if (value && value.trim()) {
                const koreanKey = getKoreanKeyName(key);
                prompt += `\n- ${koreanKey}: ${value}`;
            }
        });
    }

    prompt += `\n\n**스타일 설정:**
- 캡션 길이: ${style.length || '보통 (5-15줄)'}
- 톤앤매너: ${style.tone || '따뜻하고 전문적'}
- 이모지 사용: ${style.emoji || '문단 서두와 선생님 소개에 1~2개씩 적극 사용'}`;

    // 특별 요청사항
    if (special.must_include) {
        prompt += `\n- 꼭 포함할 내용: ${special.must_include}`;
    }
    if (special.must_avoid) {
        prompt += `\n- 제외할 표현: ${special.must_avoid}`;
    }
    if (special.region) {
        prompt += `\n- 지역 정보: ${special.region} (해시태그에 반영)`;
    }

    prompt += `\n\n---

## 응답 형식
반드시 다음 JSON 형식으로만 응답해주세요:

{
  "versionA": {
    "caption": "여기에 버전A 캡션 본문 (줄바꿈은 \\n 사용)",
    "hashtags": "모든 해시태그를 하나의 문자열로 (공백으로 구분)"
  },
  "versionB": {
    "caption": "여기에 버전B 캡션 본문 (줄바꿈은 \\n 사용)",
    "hashtags": "모든 해시태그를 하나의 문자열로 (공백으로 구분)"
  }
}

주의: JSON 형식 외의 다른 텍스트는 절대 포함하지 마세요.`;

    return prompt;
}

/**
 * 영어 키를 한국어로 변환
 */
function getKoreanKeyName(key) {
    const keyMap = {
        grade: '학년', duration: '학습 기간', changes: '변화 내용',
        special_point: '특별한 점', teacher_help: '선생님 도움', yoon_help: '윤선생 학습 도움',
        tip_area: '팁 영역', tip_target: '팁 대상', tip_content: '팁 내용',
        concern: '다루는 고민', advice: '해결책/조언', yoon_advantage: '윤선생 장점',
        philosophy: '교육 철학', choice_reason: '윤선생 선택 이유', rewarding_memory: '보람 있었던 기억',
        strength: '선생님 강점', effective_students: '효과적인 학생', class_type: '수업 유형',
        class_process: '수업 진행 방식', yoon_feature: '윤선생 학습 특징', class_result: '수업 결과',
        member_info: '회원 정보', review_type: '후기 유형', touching_point: '감동 포인트',
        highlight_point: '부각시킬 포인트', course_level: '과정/레벨', curriculum_structure: '커리큘럼 구성',
        expected_outcome: '기대 효과', event_type: '이벤트/안내', benefit: '혜택/포인트',
        how_to_apply: '신청/문의 방법', deadline: '기간/마감', daily_story: '일상/에피소드',
        message: '전달 메시지', message_target: '메시지 대상', core_message: '핵심 메시지'
    };
    
    return keyMap[key] || key;
}

/**
 * 개인정보 및 민감 정보 필터링
 */
function sanitizeContent(text) {
    if (!text) return text;
    
    // 전화번호, 이메일, 실명 등 개인정보 패턴 제거
    return text
        .replace(/\b\d{2,3}-\d{3,4}-\d{4}\b/g, '[연락처]')
        .replace(/\b\d{10,11}\b/g, '[연락처]')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[이메일]')
        .replace(/\b[가-힣]{2,4}초등학교\b/g, '[○○초등학교]')
        .replace(/\b[가-힣]{2,4}중학교\b/g, '[○○중학교]');
}

// Vercel 서버리스 함수 핸들러
export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const userData = req.body;
        
        // 입력 데이터 검증
        if (!userData || !userData.step1 || !userData.step1.topic) {
            return res.status(400).json({ 
                error: '필수 데이터가 누락되었습니다. 주제를 선택해주세요.' 
            });
        }

        // 개인정보 보호를 위한 데이터 필터링
        const sanitizedUserData = {
            ...userData,
            step1: {
                ...userData.step1,
                media: sanitizeContent(userData.step1.media)
            },
            details: Object.fromEntries(
                Object.entries(userData.details || {}).map(([key, value]) => 
                    [key, sanitizeContent(value)]
                )
            )
        };

        // GPT 프롬프트 생성
        const prompt = buildPromptFromUserData(sanitizedUserData);
        
        console.log('Generated prompt length:', prompt.length);

        // OpenAI API 호출
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // 비용 효율적인 모델 사용
            messages: [
                {
                    role: "system",
                    content: "You are a professional Instagram caption writer specializing in educational content. Always respond in valid JSON format only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.8, // 창의성 조절
            max_tokens: 2000,
            response_format: { type: "json_object" } // JSON 응답 강제
        });

        const gptResponseContent = response.choices[0].message.content;
        console.log('GPT response received');

        // JSON 파싱
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(gptResponseContent);
        } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            throw new Error('AI 응답 형식이 올바르지 않습니다.');
        }

        // 응답 구조 검증
        if (!parsedResponse.versionA || !parsedResponse.versionB) {
            throw new Error('AI 응답에 필수 버전이 누락되었습니다.');
        }

        // 필수 해시태그 확인 및 추가
        const requiredHashtags = ['#윤선생', '#윤선생영어', '#방문학습'];
        
        ['versionA', 'versionB'].forEach(version => {
            if (!parsedResponse[version].hashtags) {
                parsedResponse[version].hashtags = requiredHashtags.join(' ');
            } else {
                // 필수 해시태그가 없으면 추가
                requiredHashtags.forEach(tag => {
                    if (!parsedResponse[version].hashtags.includes(tag)) {
                        parsedResponse[version].hashtags = tag + ' ' + parsedResponse[version].hashtags;
                    }
                });
            }
            
            // 지역 해시태그 추가
            if (userData.special?.region) {
                const regionTags = `#${userData.special.region}윤선생 #${userData.special.region}영어`;
                parsedResponse[version].hashtags += ' ' + regionTags;
            }
        });

        // 성공 응답
        res.status(200).json(parsedResponse);

    } catch (error) {
        console.error('캡션 생성 오류:', error);
        
        // 오류 타입별 처리
        let errorMessage = '캡션 생성 중 오류가 발생했습니다.';
        let statusCode = 500;

        if (error.code === 'insufficient_quota') {
            errorMessage = 'API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.';
            statusCode = 429;
        } else if (error.code === 'rate_limit_exceeded') {
            errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
            statusCode = 429;
        } else if (error.message.includes('API key')) {
            errorMessage = '서버 설정 오류입니다. 관리자에게 문의해주세요.';
            statusCode = 500;
        }

        res.status(statusCode).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
