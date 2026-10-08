import styled from 'styled-components';

export const Centered = styled.div`
  padding: 64px 16px;
  text-align: center;
`;

export const Heading = styled.h1`
  margin: 0 0 8px;
  font-size: 1.5rem;
`;

export const Description = styled.p`
  margin: 0 0 24px;
  color: ${({ theme }) => theme.colors.muted};
`;

export const Action = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
`;
