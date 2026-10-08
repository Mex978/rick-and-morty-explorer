import styled from 'styled-components';

export const Bar = styled.header`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

export const Inner = styled.div`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

export const Brand = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Locales = styled.nav`
  display: flex;
  gap: 4px;
`;

export const LocaleLink = styled.span<{ $active: boolean }>`
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radius};
  font-size: 0.85rem;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  color: ${({ $active, theme }) => ($active ? theme.colors.text : theme.colors.muted)};
  background: ${({ $active, theme }) => ($active ? theme.colors.background : 'transparent')};
`;
