/* ------------------------------------------------------------------
   Site navigation.

   Routes, not content: these mirror what is registered in `App.tsx`, so
   they stay in the bundle rather than coming from the API.
------------------------------------------------------------------- */

export const navLinks = [
  { to: '/', label: 'მთავარი' },
  { to: '/programs', label: 'პროგრამები' },
  { to: '/menu', label: 'მენიუ' },
  { to: '/gallery', label: 'გალერეა' },
  { to: '/location', label: 'მდებარეობა' },
] as const
