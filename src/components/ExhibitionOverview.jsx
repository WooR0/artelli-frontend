import './ExhibitionOverview.css'

function ExhibitionOverview({ onBack }) {
  return (
    <div className="overview-viewport">
      <div className="overview-shell">
        <div className="overview-container">
          {/* 상단 검은색 헤더 */}
          <div className="overview-header">
            {onBack && (
              <button className="back-button" onClick={onBack} aria-label="뒤로가기">
                <img src="/images/back-button.svg" alt="뒤로가기" width="48" height="48" />
              </button>
            )}
            <div className="overview-header-content">
              <div className="overview-header-title-wrapper">
                <span className="overview-main-title">Echoes of Impression</span>
                <span className="overview-main-title-ko">: 인상의 잔향</span>
              </div>
              <p className="overview-location">노들갤러리 1관</p>
            </div>
          </div>

          {/* 본문 - 스크롤 가능한 전시 소개 */}
          <div className="overview-content">
            <h2 className="overview-section-title">전시 개요</h2>
            
            <h3 className="overview-subtitle">{`시선의 변화: 
인상주의에서 후기 인상주의까지`}</h3>
            
            <p className="overview-text">{`19세기 후반 유럽의 회화는 자연을 바라보는 방식에서 큰 전환을 맞이하게 된다. 인상주의 화가들은 빛이 스치는 찰나의 순간을 화면에 옮기기 위해 전통적 구성과 묘사 방식을 과감히 벗어났고, 이후 세대의 화가들은 이 변화의 여파를 각자의 방향으로 확장해가며 회화의 새로운 가능성을 탐구하였다.

이번 전시 〈Echoes of Impression〉은 모네와 모리조가 추구하던 인상주의의 감각적 혁신이 쇠라, 고흐, 고갱, 세잔을 거치며 어떻게 다른 조형 언어로 분화되었는지를 하나의 흐름으로 조망한다. 즉흥적 터치로 순간의 인상을 붙잡으려는 시도, 색을 분해하고 재조합하려는 과학적 접근, 자연의 구조를 새롭게 분석하는 태도, 그리고 감정과 상징을 화면에 투영하는 표현적 회화까지— 각기 다른 방식이지만 모두 "세상을 새롭게 보는 방법"을 모색한다는 점에서 이어진다.

전시는 이러한 시선의 변화가 서로에게 영향을 주고, 또 잔향처럼 남으며 새로운 흐름을 만들어가는 과정을 보여준다. 작품들은 개별적인 풍경을 넘어, 인상주의가 남긴 긴 여파와 그 울림을 관객에게 체감하게 한다. 이 여정을 통해 관객은 빛과 색, 감정이 서로 다른 방식으로 해석되고 재구성되는 과정을 자연스럽게 경험하게 될 것이다.`}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExhibitionOverview

