import { trigger, state, transition, style, animate, query, stagger, sequence } from '@angular/animations';

export const FADE_IN = trigger('fadeIn', [
  transition('* => *', [
    // query(':leave', [stagger(100, [animate('0.5s', style({ opacity: 0 }))])], {
    //   optional: true
    // }),
    query(
      ':enter',[
        style({ opacity: 0 }),
        stagger(100, [animate('0.2s', style({ opacity: 1 }))])
      ],
      { optional: true }
    )
  ])
]);
