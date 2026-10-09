import styled from 'styled-components';

import type { Theme } from '@/styles/theme';

export type CharacterStatus = keyof Theme['colors']['status'];

export const BackLink = styled.span`
  display: block;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Code = styled.span`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled.h1`
  margin: 12px 0 8px;
  font-size: 2rem;
  letter-spacing: -0.02em;
`;

export const Meta = styled.p`
  margin: 0 0 32px;
  color: ${({ theme }) => theme.colors.muted};
`;

export const SectionTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

export const Empty = styled.p`
  margin: 0;
  padding: 48px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
`;

export const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

export const Card = styled.li`
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  transition:
    transform 0.15s,
    box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgb(0 0 0 / 10%);
  }

  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    object-fit: cover;
  }
`;

export const AvatarFallback = styled.div`
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 3rem;
  font-weight: 700;
`;

export const CardBody = styled.div`
  padding: 12px;
`;

export const Name = styled.strong`
  display: block;
  margin-bottom: 8px;
  font-size: 1rem;
  line-height: 1.3;
`;

export const Badge = styled.span<{ $status: CharacterStatus }>`
  display: inline-block;
  margin-bottom: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: ${({ $status, theme }) => theme.colors.status[$status]};
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
