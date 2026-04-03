import React, { useState, useEffect, useRef } from 'react';
import MatchingRoom from './MatchingRoom';
import styled from '@emotion/styled';
import { keyframes as kf } from '@emotion/react';

const API = 'http://127.0.0.1:8000';

/* ─── 활동별 SVG 아이콘 ─── */
const ICONS = {
    tumbler: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="8" y="4" width="12" height="2.5" rx="1.25" fill="var(--color-primary)"/>
            <path d="M9.5 6.5L10.5 23C10.5 23.55 10.95 24 11.5 24H16.5C17.05 24 17.5 23.55 17.5 23L18.5 6.5H9.5Z"
                  fill="var(--color-primary-pale)" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M11 11H17" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M11.5 15H16.5" stroke="var(--color-primary)" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.6"/>
        </svg>
    ),
    trash: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 10L7.5 22C7.5 22.55 7.95 23 8.5 23H19.5C20.05 23 20.5 22.55 20.5 22L22 10H6Z"
                  fill="var(--color-primary-pale)" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M4 10H24" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="10" y="5" width="8" height="3" rx="1.5" stroke="var(--color-primary)" strokeWidth="1.5" fill="none"/>
            <path d="M12 14V19M16 14V19" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    recycle: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 5L17 10H11L14 5Z" fill="var(--color-primary)"/>
            <path d="M14 23L11 18H17L14 23Z" fill="var(--color-primary)"/>
            <path d="M5 17L8 12L10.5 16.5" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M23 17L20 12L17.5 16.5" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M8 17H20" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
    ),
    plogging: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="17" cy="6" r="2.5" fill="var(--color-primary)"/>
            <path d="M14 10L11 20M14 10L18 14L22 12M14 10L16 15L13 22"
                  stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 18L9 14L11 16"
                  stroke="var(--color-primary-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    ocean: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 16C6 14 8 18 10 16C12 14 14 18 16 16C18 14 20 18 22 16"
                  stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 20C6 18 8 22 10 20C12 18 14 22 16 20C18 18 20 22 22 20"
                  stroke="var(--color-primary-light)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"/>
            <path d="M14 12V6M14 6L11 9M14 6L17 9"
                  stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
};

const ACTIVITY_TYPES = ['전체', '텀블러', '쓰레기 줍기', '분리수거', '플로깅', '해안 정화'];

const getIcon = (type) => {
    const map = {
        '텀블러': ICONS.tumbler,
        '쓰레기 줍기': ICONS.trash,
        '분리수거': ICONS.recycle,
        '플로깅': ICONS.plogging,
        '해안 정화': ICONS.ocean,
    };
    return map[type] || ICONS.trash;
};

/* ─── 애니메이션 ─── */
const pulseRing = kf`
  0%   { transform: scale(0.85); opacity: 0.6; }
  50%  { transform: scale(1.05); opacity: 0.15; }
  100% { transform: scale(0.85); opacity: 0.6; }
`;

const pulseRing2 = kf`
  0%   { transform: scale(0.75); opacity: 0.4; }
  50%  { transform: scale(1.15); opacity: 0.08; }
  100% { transform: scale(0.75); opacity: 0.4; }
`;

const scaleIn = kf`
  0%   { transform: scale(0.7); opacity: 0; }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1);   opacity: 1; }
`;

const fadeSlideUp = kf`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── 스타일 ─── */
const Page = styled.div`
  padding: 0 0 16px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  padding: 56px 20px 0;
  h1 { font-size: 22px; font-weight: 800; }
  p  { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
`;

const FilterScroll = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 20px 0;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const FilterChip = styled.button`
  flex-shrink: 0;
  background: ${p => p.active ? 'var(--color-primary)' : 'var(--color-surface)'};
  color: ${p => p.active ? 'white' : 'var(--color-text-secondary)'};
  border: 1.5px solid ${p => p.active ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 40px;
  padding: 8px 16px;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
`;

const Section = styled.section`
  margin-top: 24px;
  padding: 0 20px;
`;

const SectionHeader = styled.div`
  margin-bottom: 14px;
  h3 { font-size: 17px; font-weight: 800; }
  p  { font-size: 13px; color: var(--color-text-secondary); margin-top: 2px; }
`;

const ActivityCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 18px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  border: 1.5px solid transparent;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:active {
    border-color: var(--color-primary-light);
    box-shadow: var(--shadow-md);
  }
`;

const IconCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--color-primary-pale);
  border: 1.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityInfo = styled.div`
  flex: 1;
  min-width: 0;
  .name { font-size: 16px; font-weight: 800; }
  .desc { font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; }
`;

const JoinBtn = styled.button`
  flex-shrink: 0;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  font-family: var(--font);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  p    { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  span { font-size: 14px; color: var(--color-text-secondary); }
`;

/* ─── 매칭 화면 스타일 ─── */
const MatchingArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  animation: ${fadeSlideUp} 0.35s ease both;
`;

const CircleWrap = styled.div`
  position: relative;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Ring = styled.div`
  position: absolute;
  border-radius: 50%;
  background: ${p => p.done ? 'rgba(46,125,50,0.12)' : 'rgba(46,125,50,0.18)'};
  animation: ${p => p.done ? 'none' : pulseRing} 1.8s ease-in-out infinite;
  animation-delay: ${p => p.delay || '0s'};
  width: ${p => p.size}px;
  height: ${p => p.size}px;
`;

const Ring2 = styled.div`
  position: absolute;
  border-radius: 50%;
  background: rgba(46,125,50,0.1);
  animation: ${p => p.done ? 'none' : pulseRing2} 1.8s ease-in-out infinite;
  animation-delay: 0.3s;
  width: ${p => p.size}px;
  height: ${p => p.size}px;
`;

const CoreCircle = styled.div`
  position: relative;
  z-index: 2;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: ${p => p.done
    ? 'linear-gradient(135deg, var(--color-primary), #03C75A)'
    : 'linear-gradient(135deg, #E8F5E9, #C8E6C9)'};
  box-shadow: ${p => p.done
    ? '0 8px 32px rgba(46,125,50,0.4)'
    : '0 4px 20px rgba(46,125,50,0.15)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.5s, box-shadow 0.5s;
  animation: ${p => p.done ? scaleIn : 'none'} 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
`;

const CircleText = styled.div`
  font-family: var(--font);
  font-size: ${p => p.done ? '17px' : '15px'};
  font-weight: 800;
  color: ${p => p.done ? 'white' : 'var(--color-primary)'};
  text-align: center;
  line-height: 1.3;
`;

const MatchingLabel = styled.p`
  margin-top: 32px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-secondary);
  animation: ${fadeSlideUp} 0.4s ease 0.1s both;
`;

const MatchingActivity = styled.p`
  margin-top: 6px;
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
  animation: ${fadeSlideUp} 0.4s ease 0.2s both;
`;

const CancelBtn = styled.button`
  margin-top: 36px;
  background: none;
  border: 1.5px solid var(--color-border);
  border-radius: 40px;
  padding: 11px 32px;
  font-family: var(--font);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-secondary);
  cursor: pointer;
  animation: ${fadeSlideUp} 0.4s ease 0.3s both;
  transition: border-color 0.15s, color 0.15s;
  &:hover { border-color: var(--color-primary); color: var(--color-primary); }
`;

/* ─── 컴포넌트 ─── */
export default function Matching() {
    const [activities, setActivities]     = useState([]);
    const [selectedType, setSelectedType] = useState('전체');
    const [matchingItem, setMatchingItem] = useState(null);
    const [matchDone, setMatchDone]       = useState(false);
    const [roomId, setRoomId]             = useState(null);
    const [roomItem, setRoomItem]         = useState(null);
    const pollingRef = useRef(null);

    const userId = Number(localStorage.getItem('user_id') || '1');

    // 활동 목록 조회 + 기존 매칭 상태 복원
    useEffect(() => {
        const init = async () => {
            try {
                const [activitiesRes, statusRes] = await Promise.all([
                    fetch(`${API}/activities`),
                    fetch(`${API}/matching/status?user_id=${userId}`),
                ]);
                const activitiesData = await activitiesRes.json();
                const statusData = await statusRes.json();

                const mapped = activitiesData.map(a => ({ ...a, icon: getIcon(a.type) }));
                setActivities(mapped);

                if (statusData.room_id) {
                    const roomRes = await fetch(`${API}/rooms/${statusData.room_id}`);
                    const roomData = await roomRes.json();
                    const activity = mapped.find(a => a.id === roomData.activity_id);
                    if (activity) {
                        if (statusData.can_certify) {
                            // 이미 매칭 완료 → 방으로 바로 입장
                            setRoomItem({ ...activity, room_id: statusData.room_id });
                        } else {
                            // 아직 대기 중 → 매칭 대기 화면 복원 + polling 재시작
                            setRoomId(statusData.room_id);
                            setMatchingItem(activity);
                            pollingRef.current = setInterval(async () => {
                                try {
                                    const r = await fetch(`${API}/matching/status?user_id=${userId}`);
                                    const s = await r.json();
                                    if (s.can_certify) {
                                        clearInterval(pollingRef.current);
                                        setRoomId(s.room_id);
                                        setMatchDone(true);
                                    }
                                } catch {}
                            }, 1500);
                        }
                    }
                }
            } catch (err) {
                console.error('초기화 실패:', err);
            }
        };
        init();
    }, []);

    // 언마운트 시 polling 정리
    useEffect(() => () => clearInterval(pollingRef.current), []);

    const filtered = selectedType === '전체'
        ? activities
        : activities.filter(c => c.type === selectedType);

    const handleJoin = async (challenge) => {
        try {
            const res = await fetch(
                `${API}/matching/join/${challenge.id}?user_id=${userId}`,
                { method: 'POST' }
            );
            const data = await res.json();
            setRoomId(data.room_id);
            setMatchingItem(challenge);

            if (data.can_certify) {
                setMatchDone(true);
            } else {
                setMatchDone(false);
                pollingRef.current = setInterval(async () => {
                    try {
                        const r = await fetch(`${API}/matching/status?user_id=${userId}`);
                        const s = await r.json();
                        if (s.can_certify) {
                            clearInterval(pollingRef.current);
                            setRoomId(s.room_id);
                            setMatchDone(true);
                        }
                    } catch {}
                }, 1500);
            }
        } catch (err) {
            console.error('매칭 참여 실패:', err);
            alert('서버에 연결할 수 없습니다.');
        }
    };

    const handleCancel = async () => {
        clearInterval(pollingRef.current);
        try {
            await fetch(`${API}/matching/cancel?user_id=${userId}`, { method: 'DELETE' });
        } catch (err) {
            console.error('매칭 취소 실패:', err);
        }
        setMatchingItem(null);
        setMatchDone(false);
        setRoomId(null);
    };

    const handleEnterRoom = () => {
        clearInterval(pollingRef.current);
        setRoomItem({ ...matchingItem, room_id: roomId });
        setMatchingItem(null);
        setMatchDone(false);
    };

    if (roomItem) {
        return (
            <MatchingRoom
                activity={roomItem}
                onBack={() => setRoomItem(null)}
                onEnd={() => setRoomItem(null)}
            />
        );
    }

    return (
        <Page>
            <TopBar>
                <h1>환경 보호 활동 참여</h1>
                <p>함께하면 더 큰 변화를 만들 수 있어요</p>
            </TopBar>

            {matchingItem ? (
                /* ── 매칭 화면 ── */
                <MatchingArea>
                    <CircleWrap>
                        <Ring2 size={210} done={matchDone} />
                        <Ring  size={178} done={matchDone} delay="0s" />
                        <Ring  size={155} done={matchDone} delay="0.25s" />
                        <CoreCircle done={matchDone} key={matchDone ? 'done' : 'loading'}>
                            <CircleText done={matchDone}>
                                {matchDone ? '매칭\n완료! 🎉' : '매칭중\n...'}
                            </CircleText>
                        </CoreCircle>
                    </CircleWrap>

                    <MatchingLabel>{matchDone ? '함께할 팀원을 찾았어요!' : '팀원을 찾고 있어요'}</MatchingLabel>
                    <MatchingActivity>{matchingItem.name}</MatchingActivity>

                    {matchDone ? (
                        <JoinBtn
                            onClick={handleEnterRoom}
                            style={{ marginTop: 36, padding: '13px 40px', animation: `${fadeSlideUp} 0.4s ease both` }}
                        >
                            확인
                        </JoinBtn>
                    ) : (
                        <CancelBtn onClick={handleCancel}>취소</CancelBtn>
                    )}
                </MatchingArea>
            ) : (
                /* ── 활동 목록 화면 ── */
                <>
                    <FilterScroll>
                        {ACTIVITY_TYPES.map(f => (
                            <FilterChip
                                key={f}
                                active={selectedType === f}
                                onClick={() => setSelectedType(f)}
                            >
                                {f}
                            </FilterChip>
                        ))}
                    </FilterScroll>

                    <Section>
                        <SectionHeader>
                            <h3>현재 진행 중인 활동</h3>
                            <p>총 {filtered.length}개의 활동</p>
                        </SectionHeader>

                        {filtered.length === 0 ? (
                            <EmptyState>
                                <p>😢 진행 중인 활동이 없어요</p>
                                <span>다른 유형으로 필터를 바꿔보세요</span>
                            </EmptyState>
                        ) : (
                            filtered.map(challenge => (
                                <ActivityCard key={challenge.id}>
                                    <IconCircle>{challenge.icon}</IconCircle>
                                    <ActivityInfo>
                                        <div className="name">{challenge.name}</div>
                                        <div className="desc">{challenge.desc}</div>
                                    </ActivityInfo>
                                    <JoinBtn onClick={() => handleJoin(challenge)}>
                                        참여하기
                                    </JoinBtn>
                                </ActivityCard>
                            ))
                        )}
                    </Section>
                </>
            )}
        </Page>
    );
}
