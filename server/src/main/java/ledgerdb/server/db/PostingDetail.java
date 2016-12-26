package ledgerdb.server.db;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@Entity
public class PostingDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "posting_detail_id")
    private Integer id;
    public Integer getId() { return id; }
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posting_header_id")
    @NotNull
    @JsonIgnore
    private PostingHeader postingHeader;
    public PostingHeader getPostingHeader() { return postingHeader; }
    public void setPostingHeader(PostingHeader postingHeader) {
        this.postingHeader = postingHeader;
    }
    
    private int accountId; //TODO: class Account @OneToMany
    public int getAccountId() { return accountId; }
    public void setAccountId(int accountId) { this.accountId = accountId; }
    
    @NotNull
    private BigDecimal amount;
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    private Integer statementId;
    public Integer getStatementId() { return statementId; }
    void setStatementId(Integer statementId) {
        this.statementId = statementId;
    }
    
    /*
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass())
            return false;
        PostingDetail that = (PostingDetail) o;
        return this.accountId == that.accountId
                && Objects.equals(this.amount, that.amount);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.accountId, this.amount);
    }
    */
}