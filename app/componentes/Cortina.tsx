/**
 * Sala de espera: cobre a página por ~3s na primeira visita da sessão.
 * Some sozinha, com clique, ou imediatamente se a pessoa já foi atendida
 * nesta aba (sessionStorage). Server component + script inline para não
 * piscar nem depender da hidratação.
 */
export function Cortina({ senha }: { senha: number }) {
  const script = `
(function(){
  var c=document.getElementById('cortina');
  if(!c)return;
  try{if(sessionStorage.getItem('dta-atendido')){c.remove();return}}catch(e){}
  var fim=function(){clearInterval(iv);try{sessionStorage.setItem('dta-atendido','1')}catch(e){}
    if(c.parentNode)c.remove()};
  var s=document.getElementById('cortina-seg'),n=5;
  var iv=setInterval(function(){n--;if(s&&n>0)s.textContent=String(n);if(n<1)clearInterval(iv)},1000);
  c.addEventListener('click',fim);
  setTimeout(fim,5600);
})();`;

  return (
    <>
      <div className="cortina" id="cortina" role="status" aria-label="Aguardando atendimento">
        <div>
          <div className="cortina-org">Departamento de Términos e Aberturas · Guichê 08</div>
          <div className="cortina-rotulo">sua senha</div>
          <div className="cortina-senha">{String(senha).padStart(3, "0")}</div>
          <div className="cortina-linha">Um momento · aguardando atendimento...</div>
          <div className="cortina-linha demora">Você é o próximo da fila <span className="pisca">▮</span></div>
          <div className="cortina-conta">atendimento em <b id="cortina-seg">5</b>s</div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
