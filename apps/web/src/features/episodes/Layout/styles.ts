import styled from 'styled-components';

export const Title = styled.h1`
  margin: 0 0 20px;
  font-size: 2rem;
  letter-spacing: -0.02em;
`;

export const Results = styled.div<{ $busy: boolean }>`
  opacity: ${({ $busy }) => ($busy ? 0.5 : 1)};
  transition: opacity 0.15s;
`;

export const Empty = styled.p`
  margin: 0;
  padding: 48px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`;

export const Season = styled.section`
  margin-bottom: 32px;
`;

export const SeasonTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

export const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
`;

export const Card = styled.li`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  transition:
    border-color 0.15s,
    transform 0.15s,
    box-shadow 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
  }

  a {
    display: block;
    height: 100%;
    padding: 16px;
    border-radius: inherit;
  }
`;

export const Code = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background};
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Name = styled.strong`
  display: block;
  margin: 10px 0 8px;
  font-size: 1.05rem;
  line-height: 1.3;
`;

export const Meta = styled.span`
  display: block;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
`;
