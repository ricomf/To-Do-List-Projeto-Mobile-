import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP Interceptor to handle errors globally
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro desconhecido';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Erro: ${error.error.message}`;
        console.error('Client-side error:', error.error);
      } else {
        // Server-side error
        errorMessage = error.error?.message || `Erro ${error.status}: ${error.statusText}`;
        console.error(`Server-side error: ${error.status}`, error.error);

        // Handle specific error codes
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Requisição inválida';
            break;
          case 401:
            errorMessage = 'Não autorizado. Faça login novamente.';
            break;
          case 403:
            errorMessage = 'Acesso negado';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            break;
          case 503:
            errorMessage = 'Serviço temporariamente indisponível';
            break;
        }
      }

      // TODO: Implement toast/alert service to show error messages to user
      // this.toastService.error(errorMessage);

      return throwError(() => new Error(errorMessage));
    })
  );
};
