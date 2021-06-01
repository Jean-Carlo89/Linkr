import styled from 'styled-components';
import {useContext, useEffect,useState,useRef} from 'react';
import NewPost from './NewPost';
import UserContext from '../UserContext';
import axios from 'axios';
import ReactHashtag from "react-hashtag";
import {useHistory} from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Loader from "react-loader-spinner";
import ActionsPost from './ActionsPost';
import TrendingList from './TrendingList';
import { HeartOutline, HeartSharp } from 'react-ionicons';
import InputNewText from './InputNewText';

/*import dos Posts*/
import Posts from '../Posts'

/*import de style components*/
import {PostInfo,LinkDescription,Links,Hashtag,Title,TimelineContainer,
Container,TimelinePosts,TimelineContent,LinkDetails,UserName,NoPostsYet,PostContent} from '../timelineStyledComponents'

/* Import UseInterval custom hook*/
import UseInterval from '../UseInterval'

export default function Timeline(){
    const history = useHistory()
    const [likedPosts, SetLikedPosts] = useState([]);
    const { user ,setUser} = useContext(UserContext);
    const [allPosts,setAllPosts] = useState([]);
    const [serverLoading,setServerLoading] = useState(true);
    const [olderLikes, SetOlderLikes] = useState([]); 

    const inputRef = useRef([])

    const [timelineRef,setTimelineRef] = useState(false)

    useEffect(()=>{
            update()        
    },[]);


   UseInterval(() => {
    console.log('novos posts')
    const getNewPosts = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts',config)

    getNewPosts.then((response)=>{
     
        setAllPosts(response.data.posts)

    })

       }, 15000); 

    const config = {
        headers:{
            'Authorization' : `Bearer ${user.token}`
        }
    }

    function update (i) {
         console.log('chamou update de:' + i)
        const getPosts = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts',config)
        setServerLoading(true)
        
        getPosts.then((response)=>{
            const newArray = (response.data.posts.map((p)=>({...p, toEdit: false})));
           // console.log(response)
            setAllPosts(newArray)
            setServerLoading(false)
            let sharpedHeart = []
            newArray.forEach( post => {
                post.likes.forEach(n =>{
                if(n.userId === user.user.id){
                    sharpedHeart.push({id: post.id, likes: post.likes.length})
                }})
            })
            SetLikedPosts(sharpedHeart)
            SetOlderLikes(sharpedHeart);

           
        })

        getPosts.catch((responseError)=>{           
            alert(`Houve uma falha ao obter os posts. Por favor atualize a página`)
            return
        })
    }
        
    function goToLink(e,link){
        e.preventDefault()
       window.open(link)
    }  

    function sendToHashtag(val){
       
        const newVal = val.replace('#',"")
        
        history.push(`/hashtag/${newVal}`)
    }

    function goToUserPosts(id){
        if(id!==user.user.id){
        history.push(`/user/${id}`)
        }
        else{
            history.push(`/my-posts`)
        }
    }

    function tryingToEdit(id) {
        let postsToEdit = allPosts.map((p) => {
            if(p.id === id){
                p.toEdit = !p.toEdit;
            }
            return {...p};
        })   
        setAllPosts([...postsToEdit]);

        setTimeout(()=>{

            inputRef.current[id].focus()
           },100) 
    }

    return( 
      
    <Container>
        
        <TimelineContainer>
        <Title>timeline</Title> 

                <TimelineContent>
                    <Posts noPostsMessage={'Nenhum post encontrado'}
                            update={update}
                            serverLoading={serverLoading}
                            allPosts={allPosts}
                            goToUserPosts={goToUserPosts}
                            olderLikes={olderLikes}
                            likedPosts={likedPosts}
                            user={user}
                            like={like}
                            tryingToEdit={tryingToEdit}
                            config={config}
                            inputRef={inputRef}
                            setTimelineRef={setTimelineRef}
                            goToLink={goToLink}
                            
                                        
                    />

                    <TrendingList send={sendToHashtag}/>
                   
                </TimelineContent>
        </TimelineContainer>

    </Container>
    )



    function like (id){
        const config = {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        }
        if(olderLikes.map(n => n.id).includes(id) && likedPosts.map(n => n.id).includes(id)){
            const request = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts/${id}/dislike`, {}, config)
            request.then(success => {
                SetOlderLikes(olderLikes.map( (n,i) => n.id === id? {id: id, likes: n.likes -1}: n))
                SetLikedPosts(likedPosts.filter( (n,i) => n.id !== id))
            });
            request.catch(error => alert ("Ocorreu um erro, tente novamente."))
        }
        else if(olderLikes.map(n => n.id).includes(id)){
            const request = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts/${id}/like`, {}, config)
            request.then(success => {
                SetLikedPosts([...likedPosts, {id: id, likes: success.data.post.likes.length}])
                SetOlderLikes(olderLikes.map( (n,i) => n.id === id? {id: id, likes: n.likes +1}: n))
            });
            request.catch(error => alert ("Ocorreu um erro, tente novamente."))
        }
        else if(likedPosts.map(n => n.id).includes(id)){
            const request = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts/${id}/dislike`, {}, config)
            request.then(success => {
                SetLikedPosts(likedPosts.filter( (n,i) => n.id !== id))
            });
            request.catch(error => alert ("Ocorreu um erro, tente novamente."))
        }
        else{
            const request = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts/${id}/like`, {}, config)
            request.then(success => {
                SetLikedPosts([...likedPosts, {id: id, likes: success.data.post.likes.length}])
            });
            request.catch(error => alert ("Ocorreu um erro, tente novamente."))
        }
    }
}

