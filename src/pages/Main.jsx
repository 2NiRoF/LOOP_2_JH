import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:8000';

const ACTIVITY_EMOJI = {
  '텀블러 사용하기': '🧋',
  '쓰레기 줍기': '🗑️',
  '분리수거 실천하기': '♻️',
  '플로깅 챌린지': '🏃',
  '해안 정화 활동': '🌊',
};

function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

/* ─── 스타일 ─── */
const Page = styled.div`
  padding: 0 0 16px;
  min-height: 100%;
`;

const TopBar = styled.div`
  padding: 56px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Greeting = styled.div`
  h1 { font-size: 22px; font-weight: 800; line-height: 1.3; }
  p  { font-size: 14px; color: var(--color-text-secondary); margin-top: 2px; }
`;

const PointBadge = styled.div`
  background: var(--color-primary-pale);
  border: 1.5px solid var(--color-border);
  border-radius: 40px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 800;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BannerCard = styled.div`
  margin: 20px 20px 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, #03C75A 100%);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  color: white;
  position: relative;
  overflow: hidden;

  &::after {
    content: '🌍';
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 64px;
    opacity: 0.25;
  }
`;

const BannerTitle = styled.p`
  font-size: 13px;
  font-weight: 700;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const BannerStat = styled.h2`
  font-size: 32px;
  font-weight: 800;
  margin: 4px 0 8px;
  line-height: 1;
`;

const BannerSub = styled.p`
  font-size: 13px;
  opacity: 0.85;
`;

const StreakRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 12px;
`;

const StreakDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.filled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)'};
`;

const Section = styled.section`
  margin-top: 28px;
  padding: 0 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;

  h3 { font-size: 17px; font-weight: 800; }
  button {
    background: none; border: none; cursor: pointer;
    font-size: 13px; font-weight: 700; color: var(--color-primary);
    font-family: var(--font);
  }
`;

const CertifyBtn = styled.button`
  width: 100%;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 18px;
  font-family: var(--font);
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(46,125,50,0.35);
  transition: transform 0.15s, box-shadow 0.15s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(46,125,50,0.25);
  }
`;

const FeedCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--shadow-sm);
`;

const EmojiCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
`;

const FeedInfo = styled.div`
  flex: 1;
  min-width: 0;

  .name    { font-size: 14px; font-weight: 800; }
  .act     { font-size: 13px; color: var(--color-text-secondary); margin-top: 2px; }
  .meta    { font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; }
`;

const LikeBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font);
`;


export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: localStorage.getItem('user_name') || '', points: 0, streak: 0 });
  const [feed, setFeed] = useState([]);
  const [likedIds, setLikedIds] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || '1';
    fetch(`${API}/users/me?user_id=${userId}`)
      .then(r => r.json())
      .then(data => setUser({ ...data, name: data.name || localStorage.getItem('user_name') || '' }))
      .catch(err => console.error('유저 조회 실패:', err));

    fetch(`${API}/feed`)
      .then(r => r.json())
      .then(setFeed)
      .catch(err => console.error('피드 조회 실패:', err));
  }, []);

  const toggleLike = (id) =>
    setLikedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <Page>
      {/* 상단 인사 */}
      <TopBar>
        <Greeting>
          <h1>안녕하세요, {user.name}님 👋</h1>
          <p>오늘도 지구를 지켜봐요!</p>
        </Greeting>
        <PointBadge>🌱 {(user.points || 0).toLocaleString()}P</PointBadge>
      </TopBar>

      {/* 활동 배너 */}
      <BannerCard style={{ margin: '20px 20px 0' }}>
        <BannerTitle>이번 주 활동 스트릭</BannerTitle>
        <BannerStat>{user.streak || 0}일 🔥</BannerStat>
        <BannerSub>연속으로 환경 보호에 참여 중이에요!</BannerSub>
        <StreakRow>
          {Array.from({ length: 7 }, (_, i) => (
            <StreakDot key={i} filled={i < (user.streak || 0)} />
          ))}
        </StreakRow>
      </BannerCard>

      {/* 인증하기 버튼 */}
      <Section>
        <CertifyBtn onClick={() => navigate('/matching')}>
          📸 지금 바로 인증하기
        </CertifyBtn>
      </Section>

      {/* 실시간 피드 */}
      <Section>
        <SectionHeader>
          <h3>실시간 활동 피드</h3>
          <button onClick={() => navigate('/records')}>전체보기</button>
        </SectionHeader>

        {feed.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
            아직 활동이 없어요 😢
          </p>
        ) : (
          feed.map(item => (
            <FeedCard key={item.id}>
              <EmojiCircle>{ACTIVITY_EMOJI[item.mission_name] || '✅'}</EmojiCircle>
              <FeedInfo>
                <div className="name">{item.user_name}</div>
                <div className="act">{item.mission_name}</div>
                <div className="meta">✅ 인증 완료 • {timeAgo(item.created_at)}</div>
              </FeedInfo>
              <LikeBtn onClick={() => toggleLike(item.id)}>
                <span style={{ fontSize: 20 }}>
                  {likedIds.includes(item.id) ? '💚' : '🤍'}
                </span>
              </LikeBtn>
            </FeedCard>
          ))
        )}
      </Section>
    </Page>
  );
}
