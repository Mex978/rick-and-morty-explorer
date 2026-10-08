import styled from 'styled-components';

export const BackLink = styled.span`
  display: block;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Code = styled.span`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled.h1`
  margin: 4px 0 8px;
  font-size: 1.75rem;
`;

export const Meta = styled.p`
  margin: 0 0 32px;
  color: ${({ theme }) => theme.colors.muted};
`;

export const SectionTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 1.1rem;
`;

export const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

export const Card = styled.li`
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};

  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    object-fit: cover;
  }
`;

export const CardBody = styled.div`
  padding: 12px;
`;

export const Name = styled.strong`
  display: block;
  margin-bottom: 8px;
  font-size: 1rem;
`;

export const Badge = styled.span`
  display: inline-block;
  margin-bottom: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: ${({ theme }) => theme.colors.muted};
`;

export const Detail = styled.dl`
  margin: 0;
  font-size: 0.85rem;

  dt {
    color: ${({ theme }) => theme.colors.muted};
  }

  dd {
    margin: 0 0 6px;
  }
`;
