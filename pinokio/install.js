module.exports = {
  run: [
    {
      when: "{{!kernel.exists(cwd, 'ENVIRONMENT')}}",
      method: 'fs.copy',
      params: {
        src: '_ENVIRONMENT',
        dest: 'ENVIRONMENT',
      },
    },
    {
      method: 'shell.run',
      params: {
        path: '..',
        // Never forward app secrets to the installer process. The installer
        // reads the app-scoped ENVIRONMENT file only after npm ci completes.
        message: 'node scripts/pinokio-install.mjs',
      },
    },
  ],
};
