import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:8000';

const LEVEL_LABELS = ['에코 새싹', '에코 성장', '에코 리더', '에코 챔피언', '에코 마스터'];
const LEVEL_BADGES = ['🌱', '🌿', '🌳', '🏆', '🌍'];

const BADGES = [
  { id: 1, emoji: '🌱', label: '첫 활동' },
  { id: 2, emoji: '🔥', label: '7일 연속' },
  { id: 3, emoji: '♻️', label: '분리수거 5회' },
  { id: 4, emoji: '🌊', label: '해안 정화' },
  { id: 5, emoji: '🏃', label: '플로깅 3회' },
  { id: 6, emoji: '🌍', label: '30일 연속' },
];

/* ─── 스타일 ─── */
const Page = styled.div`
  padding: 0 0 16px;
  min-height: 100%;
`;

const ProfileSection = styled.div`
  padding: 56px 20px 0;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AvatarLarge = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-pale), var(--color-border));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  flex-shrink: 0;
  border: 3px solid var(--color-primary);
`;

const ProfileInfo = styled.div`
  flex: 1;

  .name  { font-size: 20px; font-weight: 800; }
  .level { font-size: 13px; color: var(--color-text); font-weight: 700; margin-top: 3px; }
  .email { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px 20px 0;
`;

const StatCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  padding: 14px 10px;
  text-align: center;
  box-shadow: var(--shadow-sm);

  .val   { font-size: 22px; font-weight: 800; color: var(--color-primary); }
  .label { font-size: 11px; font-weight: 700; color: var(--color-text-secondary); margin-top: 4px; }
`;

const Section = styled.section`
  margin-top: 24px;
  padding: 0 20px;
`;

const SectionTitle = styled.h3`
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 14px;
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const BadgeItem = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  padding: 14px 8px;
  text-align: center;
  opacity: ${p => p.earned ? 1 : 0.4};
  box-shadow: var(--shadow-sm);
  filter: ${p => p.earned ? 'none' : 'grayscale(1)'};

  .icon  { font-size: 28px; }
  .label { font-size: 11px; font-weight: 700; color: var(--color-text-secondary); margin-top: 6px; }
`;

const MenuList = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const MenuItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-family: var(--font);
  text-align: left;
  transition: background 0.1s;

  &:last-child { border-bottom: none; }
  &:active { background: var(--color-primary-pale); }

  .icon  { font-size: 18px; width: 24px; text-align: center; }
  .label {
    flex: 1;
    font-size: 15px;
    font-weight: 700;
    color: ${p => p.danger ? '#B71C1C' : 'var(--color-text)'};
  }
  .arrow { font-size: 16px; color: var(--color-text-secondary); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
`;

const Modal = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 24px 20px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);

  h3 { font-size: 18px; font-weight: 800; margin-bottom: 18px; }
`;

const ModalLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font);
  font-size: 15px;
  margin-bottom: 14px;
  box-sizing: border-box;
  &:focus { outline: none; border-color: var(--color-primary); }
`;

const ModalBtnRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const ModalBtn = styled.button`
  flex: 1;
  padding: 13px;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: ${p => p.primary ? 'var(--color-primary)' : 'var(--color-border)'};
  color: ${p => p.primary ? '#fff' : 'var(--color-text)'};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const userId = localStorage.getItem('user_id') || '1';

  const fetchUser = () => {
    fetch(`${API}/users/me?user_id=${userId}`)
      .then(r => r.json())
      .then(data => { setUser(data); setEditName(data.name ?? ''); })
      .catch(err => console.error('유저 조회 실패:', err));
  };

  useEffect(() => { fetchUser(); }, []);

  const levelIdx = Math.min((user?.level ?? 1) - 1, LEVEL_LABELS.length - 1);
  const levelLabel = LEVEL_LABELS[levelIdx];
  const badgeEmoji = LEVEL_BADGES[levelIdx];
  const joinDate = user?.join_date
    ? new Date(user.join_date).toISOString().slice(0, 10).replace(/-/g, '.')
    : '-';

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/users/me?user_id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error('수정 실패');
      fetchUser();
      setEditOpen(false);
    } catch (err) {
      console.error('프로필 수정 실패:', err);
      alert('수정에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말 탈퇴하시겠어요? 모든 데이터가 삭제됩니다.')) return;
    try {
      const res = await fetch(`${API}/users/me?user_id=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('탈퇴 실패');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_name');
      navigate('/');
    } catch (err) {
      console.error('회원 탈퇴 실패:', err);
      alert('탈퇴에 실패했어요. 다시 시도해주세요.');
    }
  };

  const MENU_ITEMS = [
    { label: '알림 설정',    icon: '🔔', action: null },
    { label: '개인정보 수정', icon: '✏️', action: () => setEditOpen(true) },
    { label: '공지사항',     icon: '📢', action: null },
    { label: '문의하기',     icon: '💬', action: null },
    { label: '로그아웃',     icon: '🚪', action: handleLogout, danger: true },
    { label: '회원 탈퇴',    icon: '🗑️', action: handleDeleteAccount, danger: true },
  ];

  return (
    <Page>
      {/* 프로필 */}
      <ProfileSection>
        <AvatarLarge>{user?.profile_image || badgeEmoji}</AvatarLarge>
        <ProfileInfo>
          <div className="name">{user?.name ?? '-'}</div>
          <div className="level">{levelLabel}</div>
          <div className="email">{user?.email ?? '-'}</div>
        </ProfileInfo>
      </ProfileSection>

      {/* 통계 */}
      <StatRow>
        <StatCard>
          <div className="val">{(user?.points ?? 0).toLocaleString()}</div>
          <div className="label">포인트</div>
        </StatCard>
        <StatCard>
          <div className="val">{user?.streak ?? 0}</div>
          <div className="label">연속 활동</div>
        </StatCard>
        <StatCard>
          <div className="val">{joinDate}</div>
          <div className="label">가입일</div>
        </StatCard>
      </StatRow>

      {/* 배지 */}
      <Section>
        <SectionTitle>획득 배지</SectionTitle>
        <BadgeGrid>
          {BADGES.map(b => (
            <BadgeItem key={b.id} earned={b.id <= levelIdx + 1}>
              <div className="icon">{b.emoji}</div>
              <div className="label">{b.label}</div>
            </BadgeItem>
          ))}
        </BadgeGrid>
      </Section>

      {/* 메뉴 */}
      <Section>
        <SectionTitle>설정</SectionTitle>
        <MenuList>
          {MENU_ITEMS.map(item => (
            <MenuItem
              key={item.label}
              danger={item.danger}
              onClick={item.action ?? (() => alert(`${item.label} 기능은 추후 구현 예정이에요!`))}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
              <span className="arrow">›</span>
            </MenuItem>
          ))}
        </MenuList>
      </Section>

      {/* 개인정보 수정 모달 */}
      {editOpen && (
        <Overlay onClick={() => setEditOpen(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <h3>개인정보 수정</h3>
            <ModalLabel>이름</ModalLabel>
            <ModalInput
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="이름을 입력하세요"
              maxLength={20}
            />
            <ModalBtnRow>
              <ModalBtn onClick={() => setEditOpen(false)}>취소</ModalBtn>
              <ModalBtn primary disabled={saving || !editName.trim()} onClick={handleSaveProfile}>
                {saving ? '저장 중...' : '저장'}
              </ModalBtn>
            </ModalBtnRow>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
}
