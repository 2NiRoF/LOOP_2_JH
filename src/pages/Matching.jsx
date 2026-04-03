import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import MatchingRoom from './MatchingRoom';
import Authorize from './Authorize';

/* ─── API 설정 ─── */
const API = 'http://127.0.0.1:8000';

const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}`,
    };
};

/* ─── 애니메이션 ─── */
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulseRing = keyframes`
  0%   { transform: scale(0.9); opacity: 0.6; }
  50%  { transform: scale(1.05); opacity: 0.3; }
  100% { transform: scale(0.9); opacity: 0.6; }
`;

const pulseRing2 = keyframes`
  0%   { transform: scale(1); opacity: 0.4; }
  50%  { transform: scale(1.1); opacity: 0.15; }
  100% { transform: scale(1); opacity: 0.4; }
`;

const scaleIn = keyframes`
  0%   { transform: scale(0.75); }
  60%  { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

/* ─── Mock 데이터 (활동 목록) ─── */
const ACTIVITY_TYPES = ['전체', '텀블러', '쓰레기 줍기', '분리수거', '플로깅', '해안 정화'];

const MOCK_CHALLENGES = [
    { id: 1, name: '한강 플로깅',        type: '플로깅',     icon: '🏃', desc: '한강변을 달리며 쓰레기를 줍습니다', count: 24 },
    { id: 2, name: '마포구 분리수거',     type: '분리수거',   icon: '♻️', desc: '올바른 분리수거로 자원을 아껴요', count: 18 },
    { id: 3, name: '텀블러 챌린지',       type: '텀블러',     icon: '🥤', desc: '일회용 컵 대신 텀블러를 사용해요', count: 31 },
    { id: 4, name: '북한산 클린업',       type: '쓰레기 줍기', icon: '🗑️', desc: '아름다운 산을 깨끗하게 지켜요', count: 12 },
    { id: 5, name: '해운대 해안 정화',   type: '해안 정화',  icon: '🌊', desc: '바다를 위한 작은 실천', count: 9  },
];

/* ─── 스타일 ─── */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg);
`;

const TopBar = styled.div`
  padding: 52px 20px 16px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  h1 { font-size: 20px; font-weight: 800; }
  p  { font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; }
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
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
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
  font-size: 26px;
`;

const ActivityInfo = styled.div`
  flex: 1;
  min-width: 0;
  .name { font-size: 16px; font-weight: 800; }
  .desc { font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; }
`;

const JoinBtn = styled.button`
  flex-shrink: 0;
  background: ${p => p.joined ? 'var(--color-border)' : 'var(--color-primary)'};
  color: ${p => p.joined ? 'var(--color-text-secondary)' : 'white'};
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  font-family: var(--font);
  font-size: 14px;
  font-weight: 800;
  cursor: ${p => p.joined ? 'default' : 'pointer'};
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
  white-space: pre-line;
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

const WaitingCount = styled.p`
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  animation: ${fadeSlideUp} 0.4s ease 0.15s both;
`;

/* ─── 컴포넌트 ─── */
export default function Matching() {
    const [challenges, setChallenges] = useState(
        MOCK_CHALLENGES.map(c => ({ ...c, participants: [] }))
    );
    const [selectedType, setSelectedType] = useState('전체');
    const [matchingItem, setMatchingItem]  = useState(null);
    const [matchDone, setMatchDone]        = useState(false);
    const [roomItem, setRoomItem]          = useState(null);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [roomMembers, setRoomMembers]    = useState([]);
    const [waitingCount, setWaitingCount]  = useState(1);

    const pollingRef = useRef(null);

    // 컴포넌트 언마운트 시 polling 정리
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    // ── 1초 polling: 매칭 상태 확인 ──
    const startPolling = (roomId) => {
        if (pollingRef.current) clearInterval(pollingRef.current);

        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch(`${API}/matching/status`, {
                    headers: getHeaders(),
                });
                if (!res.ok) return;
                const data = await res.json();

                // 대기 인원 수 업데이트 (있으면)
                if (data.member_count) setWaitingCount(data.member_count);

                if (data.can_certify) {
                    clearInterval(pollingRef.current);
                    setCurrentRoomId(data.room_id || roomId);
                    setMatchDone(true);
                }
            } catch (err) {
                console.error('[polling 오류]', err);
            }
        }, 1000);
    };

    // ── 참여하기 버튼 ──
    const handleJoin = async (challenge) => {
        const user = JSON.parse(localStorage.getItem('user')) || { id: 0, name: '나' };

        // 로컬 참여자 추가
        setChallenges(prev =>
            prev.map(c =>
                c.id === challenge.id
                    ? { ...c, participants: [...(c.participants || []), { id: user.id }] }
                    : c
            )
        );
        setMatchingItem(challenge);
        setMatchDone(false);
        setWaitingCount(1);

        try {
            const res = await fetch(`${API}/matching/join/${challenge.id}`, {
                method: 'POST',
                headers: getHeaders(),
            });

            if (!res.ok) throw new Error('매칭 요청 실패');
            const data = await res.json();

            const roomId = data.room_id;
            setCurrentRoomId(roomId);

            // 이미 2명 이상이면 바로 완료
            if (data.can_certify) {
                setMatchDone(true);
            } else {
                // polling 시작
                startPolling(roomId);
            }

        } catch (err) {
            console.error('[매칭 오류]', err, '→ Mock 모드로 전환');
            // API 실패 시 Mock fallback (2.5초 후 완료)
            setTimeout(() => setMatchDone(true), 2500);
        }
    };

    // ── 매칭 취소 ──
    const handleCancel = async () => {
        if (pollingRef.current) clearInterval(pollingRef.current);

        try {
            await fetch(`${API}/matching/cancel`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
        } catch (err) {
            console.error('[취소 오류]', err);
        }

        // 로컬 참여자 제거
        const user = JSON.parse(localStorage.getItem('user')) || { id: 0 };
        if (matchingItem) {
            setChallenges(prev =>
                prev.map(c =>
                    c.id === matchingItem.id
                        ? { ...c, participants: (c.participants || []).filter(p => p.id !== user.id) }
                        : c
                )
            );
        }
        setMatchingItem(null);
        setMatchDone(false);
        setCurrentRoomId(null);
    };

    // ── 확인 버튼 (방 입장) ──
    const handleEnterRoom = async () => {
        if (pollingRef.current) clearInterval(pollingRef.current);

        const user = JSON.parse(localStorage.getItem('user')) || { id: 0, name: '나' };

        try {
            const res = await fetch(`${API}/rooms/${currentRoomId}`, {
                headers: getHeaders(),
            });
            if (res.ok) {
                const roomData = await res.json();
                // 실제 멤버 목록을 MatchingRoom에 전달할 형태로 변환
                const members = roomData.members.map(m => ({
                    id: m.user_id,
                    name: m.name,
                    avatar: m.user_id === user.id ? '🙋' : '🌿',
                    status: m.status === 'done' ? 'completed' : 'waiting',
                    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    isMe: m.user_id === user.id,
                }));
                setRoomMembers(members);
            }
        } catch (err) {
            console.error('[방 조회 오류]', err);
            // fallback: 나 + 익명 팀원
            setRoomMembers([
                { id: user.id, name: '나', avatar: '🙋', status: 'waiting', time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), isMe: true },
                { id: -1, name: '팀원', avatar: '🌿', status: 'waiting', time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), isMe: false },
            ]);
        }

        setRoomItem(matchingItem);
        setMatchingItem(null);
        setMatchDone(false);
    };

    // ── 인증 완료 처리 ──
    const handleConfirm = async (photo, description) => {
        if (!roomItem) return;

        const user = JSON.parse(localStorage.getItem('user')) || { name: '나', id: 0 };
        const activityType = roomItem.type;

        // 기록 저장
        const newRecord = {
            id: Date.now(),
            user: user.name,
            userId: user.id,
            activity: activityType,
            location: '내 위치',
            date: new Date().toISOString().slice(0, 10),
            point: 0,
            status: 'pending',
            emoji: getEmoji(activityType),
            photo: photo || null,
            description: description || '',
        };

        const existingRecords = JSON.parse(localStorage.getItem('records')) || [];
        const updatedRecords = [newRecord, ...existingRecords].slice(0, 8);
        localStorage.setItem('records', JSON.stringify(updatedRecords));
        window.dispatchEvent(new Event('storage'));

        // 백엔드 인증 요청
        if (currentRoomId) {
            try {
                await fetch(`${API}/rooms/${currentRoomId}/proof`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ description: description || '' }),
                });
            } catch (err) {
                console.error('[인증 제출 오류]', err);
            }
        }
    };

    const getEmoji = (type) => {
        const map = { '텀블러': '🥤', '쓰레기 줍기': '🗑️', '분리수거': '♻️', '플로깅': '🏃', '해안 정화': '🌊' };
        return map[type] || '✨';
    };

    // ── MatchingRoom 화면 ──
    if (roomItem) {
        return (
            <MatchingRoom
                activity={roomItem}
                roomId={currentRoomId}
                initialMembers={roomMembers}
                onBack={() => setRoomItem(null)}
                onConfirm={handleConfirm}
                onEnd={() => {
                    setRoomItem(null);
                    setCurrentRoomId(null);
                    setRoomMembers([]);
                }}
            />
        );
    }

    const user = JSON.parse(localStorage.getItem('user')) || { id: 0 };
    const filtered = selectedType === '전체'
        ? challenges
        : challenges.filter(c => c.type === selectedType);

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

                    {!matchDone && (
                        <WaitingCount>현재 {waitingCount}명 대기 중</WaitingCount>
                    )}

                    {matchDone ? (
                        <JoinBtn
                            joined={false}
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
                            filtered.map(challenge => {
                                const participants = challenge.participants || [];
                                const joined = !!participants.find(p => p.id === user.id);

                                let buttonText = '참여하기';
                                if (joined) buttonText = '⏳ 진행중';

                                return (
                                    <ActivityCard key={challenge.id}>
                                        <IconCircle>{challenge.icon}</IconCircle>
                                        <ActivityInfo>
                                            <div className="name">{challenge.name}</div>
                                            <div className="desc">{challenge.desc}</div>
                                        </ActivityInfo>
                                        <JoinBtn
                                            joined={joined}
                                            onClick={() => {
                                                if (!joined) handleJoin(challenge);
                                                else setRoomItem(challenge);
                                            }}
                                        >
                                            {buttonText}
                                        </JoinBtn>
                                    </ActivityCard>
                                );
                            })
                        )}
                    </Section>
                </>
            )}
        </Page>
    );
}