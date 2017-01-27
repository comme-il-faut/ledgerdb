package ledgerdb.server.db;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.validation.constraints.NotNull;

@Entity
@IdClass(AccountBalance.AccountBalancePK.class)
public class AccountBalance {

    @Id
    @NotNull
    private Integer accountId;
    public Integer getAccountId() { return accountId; }
    public void setAccountId(Integer accountId) { this.accountId = accountId; }

    @Id
    @NotNull
    private LocalDate postingDate;
    public LocalDate getPostingDate() { return postingDate; }
    public void setPostingDate(LocalDate postingDate) { this.postingDate = postingDate; }
    
    @NotNull
    private BigDecimal amount;
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public static class AccountBalancePK implements Serializable {
        private Integer accountId;
        private LocalDate postingDate;
        
        @Override
        public boolean equals(Object o) {
            if (o == this) return true;
            if (!(o instanceof AccountBalancePK))
                return false;
            AccountBalancePK that = (AccountBalancePK)o;
            return Objects.equals(this.accountId, that.accountId) &&
                    Objects.equals(this.postingDate, that.postingDate);
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(accountId, postingDate);
        }
    }
    
}
