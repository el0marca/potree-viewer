import user from "../store/user";
import {
    userPool
} from "./cognito";
import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
    CognitoRefreshToken,
} from "amazon-cognito-identity-js";
export const auth = {
    verifySession() {
        const cognitoUser = userPool.getCurrentUser()
        new Promise((res, rej) => {
                cognitoUser.getSession((err, info) => {
                    if (err) {
                        rej(err)
                    } else {
                        user.setUserInfo(info);
                        this.refreshToken(cognitoUser)
                        res()
                    }
                })
            })
            .then(() => {
                return new Promise((res, rej) => {
                    cognitoUser.getUserAttributes((err, attributes) => {
                        if (err) {
                            rej(err)
                        } else res(attributes)
                    })
                })
            })
            // .then((info) => {
            //     user.setUserInfo(info)
            //     console.log('currentUser', info)
            // })
            .catch((err) => console.error(err))
            // .finally(()=>{this.refreshToken(cognitoUser)})
    },
    refreshToken(cognitoUser) {
        console.log('er')
        const refreshToken = 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.TlBo7CMYA4nsAIGLVxmRqdcWpf_uFgIIVxFySbMqdFE3tbpxNcXoLyfZc4f3sHOKAEA4n-expURaJ7AP9-tfV95pPLeb3x5fVxXi58jvK6zUzKQWaFJ2WQRDRi0x6d3NSshxmTHfD85ngIUTVli9r5lDr850HfwO6F0WG9EnjHXA3L9cVfmzn1m1k9BgIM35XsDTLcjsbCUKPRjxbsbeRih-BCYhtad7qa6eA4Zrxn0BW_iE6js3Umds78Zh4ZcGyUOmFOKbirKfo4lmzu9HcPn8-__9wpRIHchSa7UVJDIG9Lh7fcmf3kvWdg5YJKsVRKo6aZOwPDNi3GghyLajfQ.yxELQ5M_jOh2J5N-.wDISNxPLAQB7SkOS3GuMYVMy7pA0-PhVxVfEj0dE0dTNhFbDA8W5AepgkJ102nmlaaJf02_jVrO36K-rWNXrTiqU9SYbKczrlCK9_IucMoeywMI534av6tfgSkzWP73Yln4MDqpEZg1PRvwrq8rI1Pyo_ke_XN1XfMSTYNGKJQIaIcGLf1ASzv__OzwU0Tczciit_7lOyJlCNvvyPl2Nlio8_JoZwPSorx82vL9yGeUad4m_udBbg6Dpn1G4s-PDQ_XEtaD2uIfdbNSPNdqjLyqM_dG6mig5Y_lrCFO7bnIZt9uuRHoydWR1w6RBbWXmPtUu7kqtDR7UZHMsLhqFcDvNzSXKUcXlFtKNq5QQdE-pSRP9DF5-AB6k-iTGmWTA-wUPuyDg4cwzyplFBCltO7a7qPGt6-iUUSwQvkWJBzT5Tk6pdMW3arY43LF8Fj0eeXWc_OrlYyYH4DEikmT8J89zYB756vVj7RS0pOlXFiEfNkWSHoH-hUWWEfLM2KLe0Zb5ZMMPChn270i4PENoZnZ6YtZsL3A1gTD3Rtg3aEWW-MnrXByJADUQM-yMSWrbf7vaasb1sDTZLbHByD8Svv2WlnByHhporTNwlRxe-fn4sOasosdfMRSTQrqSJalUbi06D1fzlBoB3YtUsko9Wb9UfTb6TZLHTm9dck4pgmXm_TAUvDdfSRdZ_Iv3GNIuj9FnWIr1gvpYGvDPPl0fG4AE5QU_XdkQ_xJtv89scoZqQP1wo-3GWpKLOdC6lWjVftW6R3zXIu5MRCI-qsohjIeMNjX0KLSo13LUkcRi8wi3MebePcAQAwF-4vQoRzCjtpBI3aNbGCVOxwbzW5d8mxgIiVKe3w7hVgOZaI8teyXELc3p3H_DkgDxLKpz6ZDnfaBGuJ2MemVCcu_5XivPRnVl1cAFSN1Wyi_OCnM8ndFPzTuGMRDLDb0HIZ02MK0DBopMiwMoUMuhk-SkUcXCW9Xv_Aq1t-caReNpkId4XJaxFYLA1Lr9lDWFWDIE7z6UiQ2Jmbn9nNkhstCP3N018NeN43wm9hnhxQNJGcEXiBV7UqvwwU-K_0IOtQf_rHOma4PfJhG-cqJrFJiSRiE_bi8ExAVFzkmwjt0OAP0tAbOBLPJ9RmIuxqZwzawB-aK0D1wXk1BNIOD9iYrEH7w79EgV2BKHtAgoGbTDNpv-EhNw-yVL-LFRXx5ob90zZe3C8-pLCu7DMlj5cehK3fU_kHir6Jmn_IAybxyc6t5V5vcFdEV2zxxPoSeX7uqc8l4q6TQS2TCU7zsw14UvwP9hMchVJS0GheEhc85VzZlZHQ-I_b4DaUyybZQWnSosxEkPAK44.1FyvNXdpeZgk7Fyemytm8A'
        const cognitoRefreshToken = new CognitoRefreshToken({
            RefreshToken: refreshToken,
        });
        new Promise((res, rej) =>{
                cognitoUser.refreshSession(cognitoRefreshToken, (err, result) => {

                    console.log(result)
                    if (err) {
                        return rej(err);
                    }
                    
                    res(result.idToken.jwtToken);
                })}
            )
            .then((token) => {console.log(token); user.updateToken(token)})
            .catch(() => {});
    }
}