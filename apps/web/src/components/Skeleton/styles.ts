import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
`;

export const SkeletonBlock = styled.span<{
  $width?: string;
  $height?: string;
  $radius?: string;
  $center?: boolean;
}>`
  display: block;
  justify-self: ${({ $center }) => ($center ? 'center' : 'stretch')};
  width: ${({ $width }) => $width ?? '100%'};
  height: ${({ $height }) => $height ?? '1em'};
  border-radius: ${({ $radius, theme }) => $radius ?? theme.radius};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.border} 25%,
    ${({ theme }) => theme.colors.surface} 50%,
    ${({ theme }) => theme.colors.border} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Content = styled.div`
  display: grid;
  gap: 16px;
`;

export const Grid = styled.div<{ $min: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${({ $min }) => $min}, 1fr));
  gap: 16px;
`;

export const Card = styled.div`
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
`;

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;
