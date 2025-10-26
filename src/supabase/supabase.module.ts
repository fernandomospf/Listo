import { Global, Module, Scope } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseAdminService} from './supabase-admin.service';

@Global() 
@Module({
  providers: [{ provide: SupabaseService, useClass: SupabaseService, scope: Scope.REQUEST }, SupabaseAdminService],
  exports: [SupabaseService, SupabaseAdminService],
})
export class SupabaseModule {}
