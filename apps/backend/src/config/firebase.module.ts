import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_ADMIN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        if (admin.apps.length) {
          return admin.app();
        }

        const projectId = config.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = config.get<string>('FIREBASE_CLIENT_EMAIL');
        const rawPrivateKey = config.get<string>('FIREBASE_PRIVATE_KEY');
        const storageBucket = config.get<string>('FIREBASE_STORAGE_BUCKET');

        if (!projectId || !clientEmail || !rawPrivateKey) {
          return admin.initializeApp({ storageBucket });
        }

        return admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: rawPrivateKey.replace(/\\n/g, '\n'),
          }),
          storageBucket,
        });
      },
    },
  ],
  exports: [FIREBASE_ADMIN],
})
export class FirebaseModule {}
