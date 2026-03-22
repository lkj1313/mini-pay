import static net.grinder.script.Grinder.grinder
import static org.hamcrest.Matchers.is
import static org.junit.Assert.assertThat

import net.grinder.script.GTest
import net.grinder.scriptengine.groovy.junit.GrinderRunner
import net.grinder.scriptengine.groovy.junit.annotation.BeforeProcess
import net.grinder.scriptengine.groovy.junit.annotation.BeforeThread
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.ngrinder.http.HTTPRequest
import org.ngrinder.http.HTTPRequestControl
import org.ngrinder.http.HTTPResponse
import org.ngrinder.http.cookie.CookieManager

@RunWith(GrinderRunner)
class TestRunner {

  public static GTest test
  public static HTTPRequest request
  public static Map<String, String> defaultHeaders = [:]

  private static final String BASE_URL = 'http://host.docker.internal:4301'
  private static final String ACCOUNT_A_EMAIL = 'zaq1313@naver.com'
  private static final String ACCOUNT_A_PASSWORD = 'dla1313!!'
  private static final String ACCOUNT_B_EMAIL = 'smm45108@gmail.com'
  private static final String ACCOUNT_B_PASSWORD = 'dla1313!!'
  private static final int TRANSFER_AMOUNT = 1

  @BeforeProcess
  public static void beforeProcess() {
    HTTPRequestControl.setConnectionTimeout(300000)
    test = new GTest(1, 'Mini Pay Dual Account Login And Wallets')
    request = new HTTPRequest()

    defaultHeaders.put('Content-Type', 'application/json')
    defaultHeaders.put('Accept', 'application/json')

    grinder.logger.info('mini-pay ngrinder script initialized')
  }

  @BeforeThread
  public void beforeThread() {
    test.record(this, 'test')
    grinder.statistics.delayReports = true
  }

  @Before
  public void before() {
    request.setHeaders(defaultHeaders)
  }

  @Test
  public void test() {
    boolean useAccountA = grinder.threadNumber % 2 == 0
    String loginEmail = useAccountA ? ACCOUNT_A_EMAIL : ACCOUNT_B_EMAIL
    String loginPassword = useAccountA ? ACCOUNT_A_PASSWORD : ACCOUNT_B_PASSWORD
    String recipientEmail = useAccountA ? ACCOUNT_B_EMAIL : ACCOUNT_A_EMAIL

    final String loginBody =
      "{\"email\":\"${loginEmail}\",\"password\":\"${loginPassword}\"}"

    HTTPResponse loginResponse = request.POST(
      "${BASE_URL}/auth/login",
      loginBody.getBytes('UTF-8'),
    )

    grinder.logger.info(
      "login email={}, status={}, body={}",
      loginEmail,
      loginResponse.statusCode,
      loginResponse.getBodyText(),
    )
    assertThat(loginResponse.statusCode, is(200))

    HTTPResponse walletsResponse = request.GET("${BASE_URL}/wallets/me")

    grinder.logger.info(
      "wallets email={}, status={}, body={}",
      loginEmail,
      walletsResponse.statusCode,
      walletsResponse.getBodyText(),
    )
    assertThat(walletsResponse.statusCode, is(200))

    final String transferBody =
      "{\"toEmail\":\"${recipientEmail}\",\"amount\":${TRANSFER_AMOUNT}}"

    HTTPResponse transferResponse = request.POST(
      "${BASE_URL}/wallets/transfer",
      transferBody.getBytes('UTF-8'),
    )

    grinder.logger.info(
      "transfer from={}, to={}, status={}, body={}",
      loginEmail,
      recipientEmail,
      transferResponse.statusCode,
      transferResponse.getBodyText(),
    )
    assertThat(transferResponse.statusCode, is(201))

    HTTPResponse transactionsResponse = request.GET("${BASE_URL}/transactions/me")

    grinder.logger.info(
      "transactions email={}, status={}, body={}",
      loginEmail,
      transactionsResponse.statusCode,
      transactionsResponse.getBodyText(),
    )
    assertThat(transactionsResponse.statusCode, is(200))
  }
}
