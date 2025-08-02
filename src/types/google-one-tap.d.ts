
import 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: CredentialResponse) => void; }) => void;
          renderButton: (parent: HTMLElement, options: { theme: string; size: string; type: string; text: string; }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export interface CredentialResponse {
    credential?: string;
}
