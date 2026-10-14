export const scrollbarStyles = {
  home: `
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #F0F0F0;   /* gris muy claro, casi blanco */
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background: #C0C0C0;   /* gris suave */
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #A0A0A0;   /* un poco más oscuro al pasar el mouse */
  }
`,
  default: `
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #EAEAEA;
    border-radius: 8px;
  }
  ::-webkit-scrollbar-thumb {
    background: #D1D1D1;
    border-radius: 8px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #BBBBBB;
  }
`,
  admin: `
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #fff;
    }
    ::-webkit-scrollbar-thumb {
      background: #8B8B8B;
      border-radius: 6px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #7D7A7A;
    }
  `,
};
