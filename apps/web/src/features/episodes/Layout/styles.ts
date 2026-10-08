import styled from 'styled-components';

export const Title = styled.h1`
  margin: 0 0 24px;
  font-size: 1.75rem;
`;

export const Season = styled.section`
  margin-bottom: 32px;
`;

export const SeasonTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.muted};
`;

export const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
`;

export const Card = styled.li`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  transition: border-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  a {
    display: block;
    padding: 16px;
  }
`;

export const Code = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Name = styled.strong`
  display: block;
  margin: 4px 0 8px;
  font-size: 1.05rem;
`;

export const Meta = styled.span`
  display: block;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
`;
