package com.kickscontrol.backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Full-context smoke test — requires a running PostgreSQL instance.
 * Run manually with: mvn test -Dtest=KickscontrolBackendApplicationTests -Dspring.profiles.active=dev
 */
@Disabled("Requires running PostgreSQL — execute manually against a real database")
@SpringBootTest
class KickscontrolBackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
