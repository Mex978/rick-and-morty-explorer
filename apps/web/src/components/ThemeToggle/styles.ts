import styled from 'styled-components';

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Sun = styled.svg`
  display: block;

  :root[data-theme='dark'] & {
    display: none;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) & {
      display: none;
    }
  }
`;

export const Moon = styled.svg`
  display: none;

  :root[data-theme='dark'] & {
    display: block;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) & {
      display: block;
    }
  }
`;
